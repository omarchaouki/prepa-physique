import Constants from "expo-constants";

/**
 * Client HTTP de l'application.
 *
 * Il fait trois choses que le `fetch` nu ne fait pas, et chacune corrige un
 * defaut qui se voit sur le terrain :
 *
 * 1. Il impose un delai maximal. Sans cela, un `fetch` lance sur un reseau qui
 *    accepte la connexion mais ne repond jamais, cas courant derriere un portail
 *    captif de stade, reste en attente indefiniment et l'ecran tourne sans fin.
 * 2. Il distingue « le serveur a refuse » de « le serveur est injoignable ». La
 *    premiere situation doit ramener a la connexion, la seconde ne doit surtout
 *    rien effacer : le preparateur est simplement dans un vestiaire en beton.
 * 3. Il n'ecrit jamais le jeton dans un journal. Les traces d'erreur partent
 *    parfois vers un service tiers, et un jeton valable sept jours n'a rien a y
 *    faire.
 */

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  /** Le telephone n'a pas pu joindre le serveur. Ne vient jamais du serveur. */
  | "OFFLINE";

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Vrai quand la session est a jeter : compte desactive, jeton revoque. */
  get requiresSignOut(): boolean {
    return this.code === "UNAUTHENTICATED";
  }

  /** Vrai quand il suffit d'attendre le retour du reseau. */
  get isTransient(): boolean {
    return this.code === "OFFLINE" || this.code === "SERVER_ERROR";
  }
}

const DEFAULT_TIMEOUT_MS = 20_000;

/**
 * Adresse du serveur.
 *
 * Elle vient de app.json, ce qui permet de la changer sans toucher au code et
 * d'en avoir une differente par profil de compilation EAS.
 */
export const API_BASE: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined)?.replace(/\/+$/, "") ??
  "http://localhost:3000";

export interface RequestOptions {
  token?: string | null;
  method?: "GET" | "POST";
  body?: unknown;
  timeoutMs?: number;
  /** Entete de cache, pour le catalogue. */
  etag?: string | null;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T;
  /** Absent si le serveur a repondu 304. */
  etag?: string | null;
  notModified?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { token, method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS, etag, signal } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  // Le signal externe, celui d'un ecran qu'on quitte, annule aussi la requete.
  signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(etag ? { "If-None-Match": etag } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    // Coupure, delai depasse, resolution de nom impossible : de l'exterieur
    // c'est la meme chose, le serveur n'a pas repondu.
    throw new ApiError("OFFLINE", "Serveur injoignable.");
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 304) {
    return { data: undefined as T, etag, notModified: true };
  }

  if (!response.ok) {
    let code: ApiErrorCode = "SERVER_ERROR";
    let message = `Erreur ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: { code?: string; message?: string } };
      if (payload.error?.code) code = payload.error.code as ApiErrorCode;
      if (payload.error?.message) message = payload.error.message;
    } catch {
      // Reponse non JSON : un proxy ou un portail captif s'est interpose.
    }
    throw new ApiError(code, message, response.status);
  }

  return {
    data: (await response.json()) as T,
    etag: response.headers.get("etag"),
  };
}

// ---------------------------------------------------------------------------
// Formes echangees avec le serveur
// ---------------------------------------------------------------------------

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "CLUB_ADMIN" | "COACH" | "VIEWER";
  locale: string;
  mustChangePassword: boolean;
  organizationId: string | null;
  organizationName: string | null;
}

export interface LoginResponse {
  token: string;
  expiresInSeconds: number;
  user: ApiUser;
}

export const login = (email: string, password: string, device?: string) =>
  request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password, device },
  }).then((response) => response.data);

export const fetchSession = (token: string) =>
  request<{ user: ApiUser }>("/api/auth/session", { token }).then((response) => response.data.user);
