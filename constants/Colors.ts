const fbNavy = "#072146";
const fbYellow = "#FFED00";
const fbLightNavy = "#0A3169";
const white = "#FFFFFF";
const textDark = "#1A1A1A";
const textLight = "#E0E0E0";

const lightTheme = {
  text: textDark,
  background: "#F5F7FA",
  tint: fbNavy,
  tabIconDefault: "#ccc",
  tabIconSelected: fbNavy,
  cardBackground: white,
  secondaryText: "#666",
  placeholder: "#E5E7EB",
  muted: "#CBD5E1",
};

const darkTheme = {
  text: white,
  background: "#021124",
  tint: fbYellow,
  tabIconDefault: "#555",
  tabIconSelected: fbYellow,
  cardBackground: fbLightNavy,
  secondaryText: "#A0AAB5",
  placeholder: "#1E293B",
  muted: "#475569",
};

const Colors: {
  brand: {
    navy: string;
    yellow: string;
    lightNavy: string;
    white: string;
  };
  light: typeof lightTheme;
  dark: typeof darkTheme;
  [key: string]: any;
} = {
  brand: {
    navy: fbNavy,
    yellow: fbYellow,
    lightNavy: fbLightNavy,
    white: white,
  },
  light: lightTheme,
  dark: darkTheme,
  unspecified: lightTheme,
};

export default Colors;

