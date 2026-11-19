import { Brand, DarkTheme, LightTheme, ThemeColors } from "@/constants/theme";
import { getString, setString } from "@/utils/storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";

const THEME_MODE_KEY = "fb_theme_mode_v1";

interface AppThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colorScheme: "light" | "dark";
  isDark: boolean;
  theme: ThemeColors;
  brand: typeof Brand;
}

const AppThemeContext = createContext<AppThemeContextValue>({
  mode: "system",
  setMode: () => {},
  colorScheme: "light",
  isDark: false,
  theme: LightTheme,
  brand: Brand,
});

function readStoredThemeMode(): ThemeMode {
  const saved = getString(THEME_MODE_KEY);
  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved;
  }
  return "system";
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredThemeMode());

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    setString(THEME_MODE_KEY, nextMode);
  }, []);

  const colorScheme: "light" | "dark" =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const value = useMemo<AppThemeContextValue>(() => {
    const isDark = colorScheme === "dark";
    return {
      mode,
      setMode,
      colorScheme,
      isDark,
      theme: isDark ? DarkTheme : LightTheme,
      brand: Brand,
    };
  }, [colorScheme, mode, setMode]);

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  return useContext(AppThemeContext);
}
