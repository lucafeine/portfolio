import { content } from "../content";
import { formatRelative, guessLanguage, repoLanguage } from "../lib/format";
import type { GithubState } from "../types";

type ReposProps = {
  state: GithubState;
};

export function Repos({ state }: ReposProps) {
  const repos = state.status === "ready" ? state.data.repos : [];

  return (
    <section id="depots" className="section section--repos" aria-labelledby="repos-title">
      <div className="section__head">
        <h2 id="repos-title">Dépôts</h2>
        <p>
          Classés par dernière contribution, pas par nombre d’étoiles. Le classement suit GitHub :
          si un dépôt bouge, il remonte.
        </p>
      </div>

      <div className="section__status">
        {state.status === "loading" && (
          <p className="statusLine" role="status">
            Lecture des dépôts sur GitHub…
          </p>
        )}
        {state.status === "ready" && (
          <p className="statusLine" role="status">
            {repos.length} dépôt{repos.length > 1 ? "s" : ""} public{repos.length > 1 ? "s" : ""}
          </p>
        )}
        {state.status === "error" && (
          <p className="statusLine statusLine--error" role="status">
            Les dépôts n’ont pas pu être lus pour le moment.{" "}
            <a href={`${content.githubUrl}?tab=repositories`} target="_blank" rel="noopener noreferrer">
              Voir les dépôts sur GitHub
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
            .
          </p>
        )}
      </div>

      {state.status === "loading" && (
        <div className="repoSkeleton" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span className="repoSkeleton__row" key={index} />
          ))}
        </div>
      )}

      {state.status === "ready" && repos.length > 0 && (
        <ol className="repoList">
          {repos.map((repo, index) => (
            <li key={repo.name}>
              <a className="repo" href={repo.url} target="_blank" rel="noopener noreferrer">
                <span className="repo__rank">{String(index + 1).padStart(2, "0")}</span>
                <span className="repo__body">
                  <span className="repo__head">
                    <span className="repo__name">{repo.name}</span>
                    {repo.isFork && (
                      <span className="repo__tag">
                        fork<span className="sr-only"> (dépôt forké)</span>
                      </span>
                    )}
                  </span>
                  <span
                    className="repo__desc"
                    lang={
                      repo.description && guessLanguage(repo.description) === "en"
                        ? "en"
                        : undefined
                    }
                  >
                    {repo.description ?? "Pas de description."}
                  </span>
                  <span className="repo__meta">
                    {repoLanguage(repo.language)}
                    <span aria-hidden="true"> · </span>
                    dernière contribution {formatRelative(repo.lastContributionAt ?? repo.pushedAt)}
                  </span>
                </span>
                <span className="repo__arrow" aria-hidden="true">
                  ↗
                </span>
                <span className="sr-only"> — ouvrir ce dépôt sur GitHub dans un nouvel onglet</span>
              </a>
            </li>
          ))}
        </ol>
      )}

      {state.status === "ready" && repos.length === 0 && (
        <p className="statusLine">Aucun dépôt public à afficher.</p>
      )}

      <p className="section__more">
        <a className="textLink" href={content.githubUrl} target="_blank" rel="noopener noreferrer">
          Tous les dépôts sur GitHub
          <span className="textLink__arrow" aria-hidden="true">
            ↗
          </span>
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
      </p>
    </section>
  );
}
