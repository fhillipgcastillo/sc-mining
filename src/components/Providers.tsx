"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { useEffect } from "react";

/** Syncs the resolved theme to a data-theme attribute for HeroUI. */
function HeroUISync({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      resolvedTheme === "dark" ? "dark" : "light",
    );
  }, [resolvedTheme]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <HeroUISync>{children}</HeroUISync>
    </ThemeProvider>
  );
}
