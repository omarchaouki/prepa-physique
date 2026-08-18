import { forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { TOUCH, radius, space, useTheme } from "../theme";
import { fill, translate, type MessageKey } from "../i18n";
import { useSession } from "../state/session";

/**
 * Briques d'interface communes.
 *
 * Elles portent trois regles que chaque ecran devrait sinon reappliquer, et
 * finirait par oublier :
 *
 * . toute cible tactile fait au moins quarante huit unites de haut ;
 * . tout element interactif reagit visiblement a la pression, sans decaler la
 *   mise en page ;
 * . toute couleur vient du theme, jamais d'une valeur ecrite sur place, sinon
 *   le theme sombre se troue.
 */

export const useT = () => {
  const { locale } = useSession();
  return (key: MessageKey, values?: Record<string, string | number>) => {
    const text = translate(key, locale);
    return values ? fill(text, values) : text;
  };
};

export function Screen({
  children,
  scroll = true,
  edges = ["top"],
  refreshing,
  onRefresh,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const theme = useTheme();
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl * 2 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={undefined}
      onScrollEndDrag={
        onRefresh
          ? (event) => {
              // Tirer vers le bas au dela d'un seuil declenche la
              // synchronisation. RefreshControl reste evite : il se comporte
              // mal dans une liste imbriquee sur Android.
              if (event.nativeEvent.contentOffset.y < -70 && !refreshing) onRefresh();
            }
          : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding: space.lg }}>{children}</View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }} edges={edges}>
      {body}
    </SafeAreaView>
  );
}

export function Title({ children, sub }: { children: React.ReactNode; sub?: string }) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: space.lg }}>
      <Text
        accessibilityRole="header"
        style={{ fontSize: 26, fontWeight: "700", color: theme.textPrimary, letterSpacing: -0.5 }}
      >
        {children}
      </Text>
      {sub ? (
        <Text style={{ marginTop: 4, fontSize: 14, color: theme.textMuted }}>{sub}</Text>
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.panel,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          padding: space.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Ligne pressable d'une liste. Toute la ligne est la cible, pas seulement le texte. */
export function Row({
  title,
  subtitle,
  right,
  onPress,
  accessibilityLabel,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      android_ripple={onPress ? { color: theme.accentSoft } : undefined}
      style={({ pressed }) => ({
        minHeight: TOUCH,
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        paddingVertical: space.md,
        paddingHorizontal: space.xs,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.border,
        // L'opacite ne change pas la mise en page, contrairement a une echelle.
        opacity: pressed && onPress ? 0.6 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: theme.textPrimary }}>{title}</Text>
        {subtitle ? (
          <Text style={{ marginTop: 2, fontSize: 13, color: theme.textMuted }}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  busy = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  busy?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const background =
    variant === "primary" ? theme.accent : variant === "danger" ? theme.dangerSoft : theme.sunken;
  const colour =
    variant === "primary" ? theme.onAccent : variant === "danger" ? theme.danger : theme.textPrimary;
  const inactive = disabled || busy;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy }}
      android_ripple={{ color: "rgba(255,255,255,0.18)" }}
      style={({ pressed }) => [
        {
          minHeight: TOUCH,
          borderRadius: radius.md,
          backgroundColor: background,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: space.sm,
          paddingHorizontal: space.lg,
          opacity: inactive ? 0.5 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      {busy ? <ActivityIndicator size="small" color={colour} /> : null}
      <Text style={{ fontSize: 16, fontWeight: "600", color: colour }}>{label}</Text>
    </Pressable>
  );
}

export const Field = forwardRef<TextInput, TextInputProps & { label: string; error?: string | null }>(
  function Field({ label, error, style, ...props }, ref) {
    const theme = useTheme();
    return (
      <View style={{ marginBottom: space.lg }}>
        {/* Une etiquette visible, jamais un simple texte d'invite : celui ci
            disparait des la premiere frappe et l'utilisateur ne sait plus ce
            qu'il remplit. */}
        <Text style={{ fontSize: 13, fontWeight: "600", color: theme.textSecondary, marginBottom: 6 }}>
          {label}
        </Text>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={theme.textMuted}
          style={[
            {
              minHeight: TOUCH,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: error ? theme.danger : theme.border,
              backgroundColor: theme.panel,
              paddingHorizontal: space.md,
              // Seize unites au minimum : en dessous, certains navigateurs et
              // claviers agrandissent la vue au moment de la saisie.
              fontSize: 16,
              color: theme.textPrimary,
            },
            style,
          ]}
          {...props}
        />
        {error ? (
          <Text
            accessibilityLiveRegion="polite"
            style={{ marginTop: 6, fontSize: 13, color: theme.danger }}
          >
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);

export function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const theme = useTheme();
  const map = {
    neutral: [theme.sunken, theme.textSecondary],
    success: [theme.successSoft, theme.success],
    warning: [theme.warningSoft, theme.warning],
    danger: [theme.dangerSoft, theme.danger],
  } as const;
  const [background, colour] = map[tone];
  return (
    <View style={{ backgroundColor: background, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ fontSize: 12, fontWeight: "600", color: colour }}>{label}</Text>
    </View>
  );
}

export function Empty({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <View style={{ paddingVertical: space.xxl, alignItems: "center" }}>
      <Text style={{ fontSize: 15, color: theme.textMuted, textAlign: "center" }}>{message}</Text>
    </View>
  );
}

/**
 * Bandeau d'etat de la synchronisation.
 *
 * Il est toujours visible en tete d'ecran. Sur le terrain, savoir si ce qu'on
 * vient de saisir est parti ou attend encore vaut mieux que n'importe quelle
 * autre information de l'ecran.
 */
export function SyncBar() {
  const theme = useTheme();
  const t = useT();
  const { online, syncStatus, pending, sync } = useSession();

  const [background, colour, label] = !online
    ? [theme.warningSoft, theme.warning, t("sync.offline")]
    : syncStatus === "syncing"
      ? [theme.accentSoft, theme.onAccentSoft, t("sync.syncing")]
      : syncStatus === "error"
        ? [theme.dangerSoft, theme.danger, t("sync.failed")]
        : [theme.successSoft, theme.success, t("sync.online")];

  return (
    <Pressable
      onPress={() => void sync()}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${t("sync.now")}`}
      style={{
        minHeight: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: space.sm,
        backgroundColor: background,
        borderRadius: radius.md,
        paddingHorizontal: space.md,
        marginBottom: space.lg,
      }}
    >
      {syncStatus === "syncing" ? <ActivityIndicator size="small" color={colour} /> : null}
      <Text style={{ fontSize: 13, fontWeight: "600", color: colour }}>{label}</Text>
      {pending > 0 ? (
        <Text style={{ fontSize: 13, color: colour }}>. {t("sync.pending", { count: pending })}</Text>
      ) : null}
    </Pressable>
  );
}
