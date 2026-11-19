export const Brand = {
  navy: "#072146",
  navyDark: "#04152E",
  navyLight: "#0F356B",
  yellow: "#FFED00",
  gold: "#F5C400",
  white: "#FFFFFF",
  liveRed: "#EF4444",
  winGreen: "#10B981",
  drawAmber: "#F59E0B",
  lossRed: "#EF4444",
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  cardBackground: string;
  surfaceElevated: string;
  surfaceSubtle: string;
  border: string;
  divider: string;
  text: string;
  secondaryText: string;
  tertiaryText: string;
  accent: string;
  accentSoft: string;
  tint: string;
  tabBarBg: string;
  tabIconDefault: string;
  tabIconSelected: string;
  placeholder: string;
  muted: string;
  highlightRow: string;
  badgeBg: string;
  badgeText: string;
  skeletonBase: string;
  skeletonHighlight: string;
  inputBg: string;
}

export const LightTheme: ThemeColors = {
  background: "#F3F6FA",
  surface: "#FFFFFF",
  cardBackground: "#FFFFFF",
  surfaceElevated: "#F8FAFC",
  surfaceSubtle: "#EBF0F7",
  border: "#E2E8F0",
  divider: "rgba(7, 33, 70, 0.08)",
  text: "#0F172A",
  secondaryText: "#526075",
  tertiaryText: "#8494A7",
  accent: "#072146",
  accentSoft: "rgba(7, 33, 70, 0.08)",
  tint: "#072146",
  tabBarBg: "#FFFFFF",
  tabIconDefault: "#94A3B8",
  tabIconSelected: "#072146",
  placeholder: "#E2E8F0",
  muted: "#CBD5E1",
  highlightRow: "rgba(255, 237, 0, 0.22)",
  badgeBg: "rgba(7, 33, 70, 0.08)",
  badgeText: "#072146",
  skeletonBase: "#E2E8F0",
  skeletonHighlight: "#F1F5F9",
  inputBg: "#F8FAFC",
};

export const DarkTheme: ThemeColors = {
  background: "#031022",
  surface: "#0B2242",
  cardBackground: "#0B2242",
  surfaceElevated: "#112D56",
  surfaceSubtle: "#0E284D",
  border: "rgba(255, 255, 255, 0.10)",
  divider: "rgba(255, 255, 255, 0.08)",
  text: "#F8FAFC",
  secondaryText: "#9FB3CC",
  tertiaryText: "#6B82A0",
  accent: "#FFED00",
  accentSoft: "rgba(255, 237, 0, 0.14)",
  tint: "#FFED00",
  tabBarBg: "#051731",
  tabIconDefault: "#64748B",
  tabIconSelected: "#FFED00",
  placeholder: "rgba(255, 255, 255, 0.12)",
  muted: "#334155",
  highlightRow: "rgba(255, 237, 0, 0.16)",
  badgeBg: "rgba(255, 237, 0, 0.14)",
  badgeText: "#FFED00",
  skeletonBase: "#102B52",
  skeletonHighlight: "#193C6E",
  inputBg: "#071A34",
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;
