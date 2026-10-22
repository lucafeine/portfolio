import { content } from "../content";

export function LinksSection() {
  return (
    <section id="liens" className="section section--links" aria-labelledby="links-title">
      <div className="section__head">
        <h2 id="links-title">Liens externes</h2>
        <p>Le code est sur GitHub. Les nouvelles, sur Bluesky.</p>
      </div>

      <ul className="networkList">
        {content.links.map((link) => (
          <li key={link.href}>
            <a
              className="networkLink"
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <span className="networkLink__label">{link.label}</span>
              <span className="networkLink__detail">{link.detail}</span>
              <span className="networkLink__arrow" aria-hidden="true">
                {link.external ? "↗" : "→"}
              </span>
              {link.external && <span className="sr-only"> (nouvel onglet)</span>}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
