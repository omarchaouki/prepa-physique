import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";

import { ApiError, fetchSession, login as apiLogin, type ApiUser } from "../api/client";
import { wipe } from "../db";
import { lastSyncAt, pendingCount, runSync, type SyncReport } from "../sync/engine";
import { deviceLocale, type Locale } from "../i18n";

/**
 * Etat de session et orchestration de la synchronisation.
 *
 * Le point delicat de cette application n'est pas la connexion, c'est la
 * distinction entre deux situations qui se ressemblent de l'exterieur :
 *
 *   . le serveur a refuse le jeton    -> il faut effacer et se reconnecter
 *   . le serveur est injoignable      -> il ne faut surtout rien effacer
 *
 * Les confondre donne le pire defaut possible pour une application de terrain :
 * le preparateur est deconnecte au milieu d'une batterie de tests parce qu'il
 * est passe sous une tribune. Toute erreur reseau est donc traitee comme
 * transitoire, et seul un 401 franc met fin a la session.
 */

const TOKEN_KEY = "lamsaa.token";
const USER_KEY = "lamsaa.user";
const LOCALE_KEY = "lamsaa.locale";

export type SyncStatus = "idle" | "syncing" | "offline" | "error";

interface SessionValue {
  ready: boolean;
  user: ApiUser | null;
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  online: boolean;
  syncStatus: SyncStatus;
  pending: number;
  lastSync: Date | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sync: (options?: { silent?: boolean }) => Promise<SyncReport | null>;
  refreshPending: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export const useSession = (): SessionValue => {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession doit etre utilise dans SessionProvider.");
  return value;
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [online, setOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [pending, setPending] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const token = useRef<string | null>(null);
  // Empeche deux synchronisations simultanees : le retour du reseau et le
  // retour au premier plan arrivent souvent dans la meme seconde.
  const running = useRef(false);

  const refreshPending = useCallback(async () => {
    setPending(await pendingCount());
  }, []);

  const clearSession = useCallback(async () => {
    token.current = null;
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    // Les donnees des joueurs sont des donnees de sante : elles ne restent pas
    // sur un telephone dont plus personne n'est responsable.
    await wipe();
    setPending(0);
    setLastSync(null);
  }, []);

  const sync = useCallback(
    async (options?: { silent?: boolean }): Promise<SyncReport | null> => {
      if (!token.current || running.current) return null;
      running.current = true;
      if (!options?.silent) setSyncStatus("syncing");

      try {
        const report = await runSync(token.current, locale);
        setLastSync(await lastSyncAt());
        await refreshPending();
        setSyncStatus("idle");
        return report;
      } catch (error) {
        if (error instanceof ApiError && error.requiresSignOut) {
          // Compte desactive ou sessions revoquees depuis le panneau
          // proprietaire : la session n'a plus de raison d'exister.
          await clearSession();
          setSyncStatus("idle");
          return null;
        }
        setSyncStatus(error instanceof ApiError && error.code === "OFFLINE" ? "offline" : "error");
        return null;
      } finally {
        running.current = false;
      }
    },
    [clearSession, refreshPending, locale],
  );

  // Restauration au lancement.
  useEffect(() => {
    void (async () => {
      const storedLocale = await SecureStore.getItemAsync(LOCALE_KEY);
      setLocaleState(storedLocale === "en" || storedLocale === "fr" ? storedLocale : deviceLocale());

      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_KEY);

      if (storedToken && storedUser) {
        token.current = storedToken;
        // On ouvre sur les donnees locales immediatement, sans attendre le
        // reseau : c'est tout l'interet d'une application qui possede sa base.
        setUser(JSON.parse(storedUser) as ApiUser);
        setLastSync(await lastSyncAt());
        await refreshPending();

        // La validite du jeton est verifiee ensuite, en arriere plan.
        void (async () => {
          try {
            const fresh = await fetchSession(storedToken);
            setUser(fresh);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(fresh));
            void sync({ silent: true });
          } catch (error) {
            if (error instanceof ApiError && error.requiresSignOut) await clearSession();
            // Une erreur reseau ne touche a rien : l'application reste ouverte
            // sur ses donnees locales.
          }
        })();
      }

      setReady(true);
    })();
  }, [clearSession, refreshPending, sync]);

  // Etat du reseau. Le retour de la connexion declenche une synchronisation.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const reachable = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnline((wasOnline) => {
        if (!wasOnline && reachable && token.current) void sync({ silent: true });
        return reachable;
      });
    });
    return unsubscribe;
  }, [sync]);

  // Retour au premier plan : on rattrape ce qui a change pendant l'absence.
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === "active" && token.current) void sync({ silent: true });
    };
    const subscription = AppState.addEventListener("change", onChange);
    return () => subscription.remove();
  }, [sync]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin(email.trim(), password, "Android");
      token.current = response.token;
      await SecureStore.setItemAsync(TOKEN_KEY, response.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
      setUser(response.user);

      // La langue enregistree sur le compte prime sur celle du telephone.
      if (response.user.locale === "en" || response.user.locale === "fr") {
        setLocaleState(response.user.locale);
        await SecureStore.setItemAsync(LOCALE_KEY, response.user.locale);
      }

      await sync();
    },
    [sync],
  );

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    await SecureStore.setItemAsync(LOCALE_KEY, next);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      ready,
      user,
      locale,
      setLocale,
      online,
      syncStatus,
      pending,
      lastSync,
      signIn,
      signOut: clearSession,
      sync,
      refreshPending,
    }),
    [ready, user, locale, setLocale, online, syncStatus, pending, lastSync, signIn, clearSession, sync, refreshPending],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
