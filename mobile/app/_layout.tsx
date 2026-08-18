import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SessionProvider, useSession } from "../src/state/session";
import { LaunchMark } from "../src/components/AnimatedLogo";
import { translate } from "../src/i18n";
import { useTheme } from "../src/theme";

/**
 * Racine de l'application.
 *
 * Trois choses s'enchainent au lancement, et l'ordre compte :
 *
 * 1. L'ecran de demarrage natif reste affiche pendant que la base locale
 *    s'ouvre et que le jeton est relu. Sans cela on verrait un ecran blanc.
 * 2. Il cede la place au logo anime, qui se trace. Cette animation habille une
 *    attente qui existe de toute facon, elle n'en ajoute pas : l'ecran suivant
 *    s'affiche des qu'il est pret, meme si le trace n'est pas fini.
 * 3. La redirection se fait ensuite, vers la connexion ou vers l'application.
 *    Elle attend que la session soit lue, sinon un utilisateur deja connecte
 *    verrait passer l'ecran de connexion a chaque lancement.
 */

// L'ecran natif ne se retire pas tout seul : c'est nous qui decidons quand.
void SplashScreen.preventAutoHideAsync();

function Gate() {
  const { ready, user, locale } = useSession();
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();

  const [introDone, setIntroDone] = useState(false);

  const onNativeSplashHidden = useCallback(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (ready) onNativeSplashHidden();
  }, [ready, onNativeSplashHidden]);

  useEffect(() => {
    if (!ready || !introDone) return;

    const inApp = segments[0] === "(app)";
    if (user && !inApp) {
      router.replace("/(app)");
    } else if (!user && inApp) {
      router.replace("/");
    }
  }, [ready, introDone, user, segments, router]);

  // Le logo anime couvre l'ecran tant que la session n'est pas lue et que le
  // trace n'est pas termine. Les deux conditions comptent : une session lue
  // instantanement ne doit pas faire clignoter le logo pendant deux images.
  if (!ready || !introDone) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.accent, alignItems: "center", justifyContent: "center" }}>
        <StatusBar style="light" />
        <LaunchMark
          name={translate("app.name", locale)}
          tagline={translate("app.tagline", locale)}
          publisher={translate("app.publisher", locale)}
          onDone={() => setIntroDone(true)}
        />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.page },
          headerTintColor: theme.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.page },
          // Le geste de retour du systeme reste prioritaire : Android 14 et
          // suivants animent le retour predictif, l'intercepter le casse.
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <Gate />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
