import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type ThemeMode = Theme | "system";

const STORAGE_KEY = "lucafeine-theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readMode(): ThemeMode {
  if (typeof document === "undefined") {
    return "system";
  }

  const applied = document.documentElement.dataset.themeMode;

  if (applied === "light" || applied === "dark" || applied === "system") {
    return applied;
  }

  // Filet de sécurité si le script d'amorçage n'a pas pu s'exécuter.
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Stockage indisponible : on suit le système.
  }

  return "system";
}

/**
 * Thème clair / sombre / système.
 * Le thème initial est posé par le script inline de index.html (avant le premier
 * rendu, pour éviter un flash). En mode « système », le réglage de l'OS est suivi
 * en direct ; les modes clair et sombre sont des choix explicites mémorisés.
 */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(readMode);
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  const theme: Theme = mode === "system" ? systemTheme : mode;

  useEffect(() => {
    document.documentElement.dataset.themeMode = mode;

    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Navigation privée ou stockage bloqué : le choix vaut pour la session.
    }
  }, [mode]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    // Le chrome du navigateur reprend le papier du thème, sans valeur en dur.
    const paper = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--color-paper")
      .trim();

    if (paper) {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", paper);
    }
  }, [theme]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
  }, []);

  const cycleTheme = useCallback(() => {
    setMode((current) => {
      if (current === "light") {
        return "dark";
      }

      if (current === "dark") {
        return "system";
      }

      return "light";
    });
  }, []);

  return { mode, theme, cycleTheme };
}
