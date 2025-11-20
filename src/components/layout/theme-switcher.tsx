"use client";

import { Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { THEME_PRESETS } from "@/lib/theme-presets";
import { useThemeStore } from "@/store/theme-store";

export function ThemeSwitcher() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-border/60 bg-[hsl(var(--surface-panel))] px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]/60"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Theme</span>
        <span className="text-muted-foreground sm:hidden">Theme</span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-[hsl(var(--surface-panel))] p-2 text-xs shadow-[0_18px_42px_-28px_hsl(var(--shadow-soft))]">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Color stories
          </p>
          <ul className="space-y-1" role="listbox">
            {THEME_PRESETS.map((preset) => (
              <li key={preset.value}>
                <button
                  type="button"
                  onClick={() => {
                    setTheme(preset.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg border border-transparent bg-[hsl(var(--surface-panel))] px-3 py-2 text-left text-xs transition-colors",
                    theme === preset.value
                      ? "border-primary/40 text-foreground shadow-[0_15px_30px_-24px_hsl(var(--shadow-soft))]"
                      : "text-muted-foreground hover:border-border hover:bg-[hsl(var(--surface-interactive))] hover:text-foreground"
                  )}
                  role="option"
                  aria-selected={theme === preset.value}
                >
                  <div>
                    <p className="font-semibold text-foreground">{preset.label}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{preset.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {preset.swatch.map((color) => (
                      <span
                        key={color}
                        className="h-4 w-4 rounded-full border border-border/40 shadow-sm"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
