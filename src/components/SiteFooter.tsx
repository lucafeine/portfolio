import { content } from "../content";
import { formatDateTime } from "../lib/format";
import type { GithubState } from "../types";

type FooterProps = {
  state: GithubState;
};

export function SiteFooter({ state }: FooterProps) {
  const year = new Date().getFullYear();
  const updatedAt = state.status === "ready" ? state.data.updatedAt : null;

  return (
    <footer className="footer">
      <div className="footer__letter">
        <p className="footer__close">À bientôt,</p>
        <p className="footer__sign">lucafeine</p>
        <p className="footer__ps">
          P.S. — pour discuter, écrivez à{" "}
          <a href={`mailto:${content.email}`}>{content.email}</a>.
        </p>
      </div>

      <div className="footer__meta">
        <p>© {year} lucafeine · {content.location}</p>
        <p>
          {state.status === "loading" && "Lecture des données GitHub en cours."}
          {state.status === "error" && (
            <>
              Données GitHub indisponibles pour le moment.{" "}
              <a href={content.githubUrl} target="_blank" rel="noopener noreferrer">
                Ouvrir GitHub
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
              .
            </>
          )}
          {state.status === "ready" && updatedAt && (
            <>
              Données GitHub lues le <time dateTime={updatedAt}>{formatDateTime(updatedAt)}</time>.
            </>
          )}
        </p>
        <p className="footer__fine">
          Aucun cookie, aucun traceur.{" "}
          <a className="footer__top" href="#contenu">
            Retour en haut <span aria-hidden="true">↑</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
