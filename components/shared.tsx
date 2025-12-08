"use client";

import { ThemeToggle } from "./theme";
import { useTheme as useNextTheme } from "next-themes";

export function Footer() {
  const { theme, setTheme } = useNextTheme();

  return (
    <footer className="py-12 sm:py-16 border-t border-border">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            © 2025 Luigi Girke. All rights reserved.
          </div>
          <div className="text-xs text-muted-foreground">
            Built with Next.js
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle
            theme={theme as "light" | "dark"}
            toggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
        </div>
      </div>
    </footer>
  );
}
