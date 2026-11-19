import { Brand, DarkTheme, LightTheme, ThemeColors } from "./theme";

const Colors: {
  brand: typeof Brand;
  light: ThemeColors;
  dark: ThemeColors;
  unspecified: ThemeColors;
  [key: string]: unknown;
} = {
  brand: Brand,
  light: LightTheme,
  dark: DarkTheme,
  unspecified: LightTheme,
};

export default Colors;
