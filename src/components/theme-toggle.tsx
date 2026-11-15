"use client";

import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => {
        const dark = document.documentElement.classList.toggle("dark");
        try {
          localStorage.setItem("booknook-theme", dark ? "dark" : "light");
        } catch {
          // Storage unavailable (e.g. private mode) — theme just won't persist.
        }
      }}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-foreground/10 text-foreground transition-colors hover:bg-foreground/5"
    >
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
    </button>
  );
}
