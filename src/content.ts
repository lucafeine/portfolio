/**
 * Tout le contenu fixe du site vit ici.
 * Modifiez ce fichier pour la bio, les liens et l’adresse de contact —
 * les dépôts et les commits, eux, viennent directement de GitHub.
 */
export const content = {
  handle: "lucafeine",
  siteUrl: "https://lucafeine.fr",
  email: "lucafeine@proton.me",
  location: "France",
  headline: "Développeur et bidouilleur en tout genre\u00A0!",
  intro:
    "Je fais des p’tits projets pour m’amuser, m’améliorer ou plus simplement répondre à mes besoins et ceux de mes proches au quotidien.",
  githubUrl: "https://github.com/lucafeine",
  nav: [
    { label: "Dépôts", href: "#depots" },
    { label: "Journal", href: "#journal" },
    { label: "Liens externes", href: "#liens" },
  ],
  links: [
    {
      label: "GitHub",
      href: "https://github.com/lucafeine",
      detail: "github.com/lucafeine",
      external: true,
    },
    {
      label: "Bluesky",
      href: "https://bsky.app/profile/lucafeine.fr",
      detail: "bsky.app/profile/lucafeine.fr",
      external: true,
    },
  ],
} as const;

/** Photo de profil : l’URL publique GitHub renvoie toujours l’avatar actuel. */
export const avatarUrl = "https://github.com/lucafeine.png?size=480";
export const avatarSrcSet =
  "https://github.com/lucafeine.png?size=240 240w, https://github.com/lucafeine.png?size=480 480w";
