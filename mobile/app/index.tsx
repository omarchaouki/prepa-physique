import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, type TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiError } from "../src/api/client";
import { useSession } from "../src/state/session";
import { AnimatedLogo } from "../src/components/AnimatedLogo";
import { Button, Field, useT } from "../src/components/ui";
import { space, useTheme } from "../src/theme";

/**
 * Ecran de connexion, premier ecran de l'application.
 *
 * C'est le seul moment ou le reseau est indispensable : le jeton doit venir du
 * serveur. Le message le dit clairement plutot que d'afficher un echec vague,
 * parce qu'un preparateur qui essaie de se connecter dans un vestiaire en beton
 * doit comprendre en une seconde qu'il faut sortir, pas retaper son mot de
 * passe.
 *
 * Une fois connecte, il ne reverra cet ecran que s'il se deconnecte lui meme ou
 * si le proprietaire revoque sa session.
 */
export default function LoginScreen() {
  const theme = useTheme();
  const t = useT();
  const { signIn, online, locale, setLocale } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  const submit = async () => {
    if (busy) return;
    if (!email.trim() || !password) {
      setError(t("common.required"));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      // La redirection est faite par la racine, qui observe la session.
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(
          caught.code === "OFFLINE"
            ? t("login.serverUnreachable")
            : caught.code === "RATE_LIMITED"
              ? t("login.rateLimited")
              : t("login.failed"),
        );
      } else {
        setError(t("login.failed"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: space.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: "center", marginBottom: space.xxl }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 22,
                backgroundColor: theme.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AnimatedLogo size={62} />
            </View>
            <Text
              accessibilityRole="header"
              style={{ marginTop: space.lg, fontSize: 28, fontWeight: "700", color: theme.textPrimary, letterSpacing: -0.6 }}
            >
              {t("app.name")}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 14, color: theme.textMuted }}>
              {t("app.tagline")}
            </Text>
          </View>

          {!online ? (
            <View
              accessibilityLiveRegion="polite"
              style={{
                backgroundColor: theme.warningSoft,
                borderRadius: 10,
                padding: space.md,
                marginBottom: space.lg,
              }}
            >
              <Text style={{ fontSize: 14, color: theme.warning }}>{t("login.offline")}</Text>
            </View>
          ) : null}

          {error ? (
            <View
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              style={{
                backgroundColor: theme.dangerSoft,
                borderRadius: 10,
                padding: space.md,
                marginBottom: space.lg,
              }}
            >
              <Text style={{ fontSize: 14, color: theme.danger }}>{error}</Text>
            </View>
          ) : null}

          <Field
            label={t("login.email")}
            value={email}
            onChangeText={setEmail}
            // Le clavier du telephone s'adapte au type : arobase visible,
            // majuscule automatique desactivee, correction coupee.
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!busy}
          />

          <View>
            <Field
              ref={passwordRef}
              label={t("login.password")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!visible}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={() => void submit()}
              editable={!busy}
              style={{ paddingRight: 96 }}
            />
            <Pressable
              onPress={() => setVisible((current) => !current)}
              accessibilityRole="button"
              accessibilityLabel={visible ? t("login.hidePassword") : t("login.showPassword")}
              hitSlop={12}
              style={{ position: "absolute", right: 12, top: 30, minHeight: 44, justifyContent: "center" }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: theme.accent }}>
                {visible ? t("login.hidePassword") : t("login.showPassword")}
              </Text>
            </Pressable>
          </View>

          <Button label={busy ? t("login.pending") : t("login.submit")} onPress={() => void submit()} busy={busy} />

          <Pressable
            onPress={() => void setLocale(locale === "fr" ? "en" : "fr")}
            accessibilityRole="button"
            accessibilityLabel={locale === "fr" ? "Switch to English" : "Passer en francais"}
            style={{ minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: space.lg }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: theme.textMuted }}>
              {locale === "fr" ? "English" : "Francais"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
