import { useTheme, type ThemeMode } from "../hooks/useTheme";

const MODE_LABELS: Record<ThemeMode, string> = {
  light: "Clair",
  dark: "Sombre",
  system: "Système",
};

const NEXT_LABELS: Record<ThemeMode, string> = {
  light: "sombre",
  dark: "système",
  system: "clair",
};

function ModeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === "light") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
        <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (mode === "dark") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
        <path
          d="M20.2 14.6A8.2 8.2 0 1 1 9.4 3.8a6.7 6.7 0 0 0 10.8 10.8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 4a8 8 0 0 0 0 16Z" fill="currentColor" />
    </svg>
  );
}

export function ThemeToggle() {
  const { mode, cycleTheme } = useTheme();
  const label = MODE_LABELS[mode];

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={cycleTheme}
      aria-label={`Thème ${label.toLowerCase()}. Passer au thème ${NEXT_LABELS[mode]}.`}
    >
      <span className="themeToggle__icon" aria-hidden="true">
        <ModeIcon mode={mode} />
      </span>
      <span className="themeToggle__label">{label}</span>
    </button>
  );
}
