import { create } from "zustand";

import { DEFAULT_THEME, THEME_PRESETS, type ThemeName } from "@/lib/theme-presets";

const THEME_STORAGE_KEY = "hms-theme";

const isValidTheme = (value: string | null): value is ThemeName =>
  Boolean(value && THEME_PRESETS.some((preset) => preset.value === value));

type ThemeState = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  initialize: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: DEFAULT_THEME,
  setTheme: (theme) => {
    const nextTheme = isValidTheme(theme) ? theme : DEFAULT_THEME;

    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = nextTheme;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }

    set({ theme: nextTheme });
  },
  initialize: () => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const resolved = isValidTheme(stored) ? stored : DEFAULT_THEME;

    if (resolved !== get().theme) {
      set({ theme: resolved });
    }

    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = resolved;
    }
  },
}));
