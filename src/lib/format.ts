const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

const relativeFormatter = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

export function formatDate(value: string | null): string {
  if (!value) return "date inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date inconnue";
  return dateFormatter.format(date);
}

export function formatDateTime(value: string | null): string {
  if (!value) return "date inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date inconnue";
  return `${dateFormatter.format(date)} à ${timeFormatter.format(date)}`;
}

export function formatRelative(value: string | null): string {
  if (!value) return "date inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date inconnue";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (Math.abs(seconds) < 60) return relativeFormatter.format(seconds, "second");
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, "minute");
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, "hour");
  if (Math.abs(days) < 31) return relativeFormatter.format(days, "day");
  return formatDate(value);
}

export function repoLanguage(value: string | null): string {
  return value ?? "langage non précisé";
}

const FRENCH_WORDS =
  /\b(le|la|les|un|une|des|du|de|en|et|pour|avec|dans|sur|plus|pas|est|au|aux|ce|cette|ces|ne|que|qui|tout|annonce|salon|grand|gras|trois|secondes|centrer|avatars|defiler|au-dela|quatre|layout|affichait)\b/gi;
const ENGLISH_WORDS =
  /\b(the|and|with|from|this|that|add|adds|added|fix|fixes|update|updates|rewrite|generate|track|drop|keep|remove|rename|prepare|strike|localize|regenerate|cleaner|only|section|visuals|metadata|languages|deafen|pictogram|authorization|errors|listing|assets|marketplace|presentation|banner|spanish|localization|identifier|contributor|identity|readme|commit|initial)\b/gi;

/** Heuristique légère pour baliser les passages anglophones (RGAA 8.8). */
export function guessLanguage(value: string): "fr" | "en" {
  if (/[àâçéèêëîïôûùüÿœ]/i.test(value)) return "fr";

  const frenchHits = value.match(FRENCH_WORDS)?.length ?? 0;
  const englishHits = value.match(ENGLISH_WORDS)?.length ?? 0;
  return englishHits > frenchHits ? "en" : "fr";
}

