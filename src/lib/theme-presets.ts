export type ThemeName = "sky" | "emerald" | "rose" | "violet" | "slate";

export type ThemePreset = {
  value: ThemeName;
  label: string;
  description: string;
  swatch: string[];
};

export const DEFAULT_THEME: ThemeName = "sky";

export const THEME_PRESETS: ThemePreset[] = [
  {
    value: "sky",
    label: "Skyline",
    description: "Aqua primary with electric violet and sunrise accents.",
    swatch: ["hsl(190 86% 34%)", "hsl(227 88% 58%)", "hsl(33 96% 54%)"],
  },
  {
    value: "emerald",
    label: "Emerald",
    description: "Jade greens paired with teal depth and amber highlights.",
    swatch: ["hsl(161 94% 30%)", "hsl(194 72% 42%)", "hsl(40 96% 52%)"],
  },
  {
    value: "rose",
    label: "Rose Quartz",
    description: "Vibrant rose base balanced by lavender and apricot notes.",
    swatch: ["hsl(348 84% 54%)", "hsl(265 70% 60%)", "hsl(28 95% 58%)"],
  },
  {
    value: "violet",
    label: "Violet Nova",
    description: "Luminous violets with cyan contrast and magenta energy.",
    swatch: ["hsl(262 84% 56%)", "hsl(198 86% 58%)", "hsl(312 80% 62%)"],
  },
  {
    value: "slate",
    label: "Modern Slate",
    description: "Cool slate neutrals with cobalt depth and saffron accent.",
    swatch: ["hsl(224 64% 52%)", "hsl(200 36% 38%)", "hsl(35 92% 58%)"],
  },
];
