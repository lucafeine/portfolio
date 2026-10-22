import { content } from "../content";
import { formatDate, formatRelative, guessLanguage } from "../lib/format";
import { ContributionGraph } from "./ContributionGraph";
import type { GithubState } from "../types";

type JournalProps = {
  state: GithubState;
};

export function Journal({ state }: JournalProps) {
  const updatedAt = state.status === "ready" ? state.data.updatedAt : null;
  const commits = state.status === "ready" ? state.data.commits : [];

  return (
    <section id="journal" className="section section--journal" aria-labelledby="journal-title">
      <div className="section__head">
        <h2 id="journal-title">Journal</h2>
        {/*<p>
          Les six derniers commits, dans l’ordre où ils sont arrivés. Le graphique reprend les
          contributions des douze derniers mois.
        </p>*/}
      </div>

      <ContributionGraph state={state} />

      <div className="section__status">
        {state.status === "ready" && updatedAt && (
          <p className="statusLine" role="status">
            {commits.length} commit{commits.length > 1 ? "s" : ""} · dernière lecture{" "}
            <time dateTime={updatedAt}>{formatRelative(updatedAt)}</time>
          </p>
        )}
        {state.status === "error" && (
          <p className="statusLine statusLine--error" role="status">
            Les commits n’ont pas pu être lus pour le moment.{" "}
            <a href={`${content.githubUrl}?tab=repositories`} target="_blank" rel="noopener noreferrer">
              Voir l’activité sur GitHub
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
            .
          </p>
        )}
      </div>

      {state.status === "loading" && (
        <div className="commitSkeleton" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <span className="commitSkeleton__row" key={index} />
          ))}
        </div>
      )}

      {state.status === "ready" && commits.length > 0 && (
        <ol className="commitList">
          {commits.map((commit) => (
            <li key={commit.sha}>
              <a className="commit" href={commit.url} target="_blank" rel="noopener noreferrer">
                <span className="commit__date">
                  <time dateTime={commit.date}>{formatDate(commit.date)}</time>
                </span>
                <span className="commit__body">
                  <span className="commit__repo">{commit.repo}</span>
                  <span
                    className="commit__message"
                    lang={guessLanguage(commit.message) === "en" ? "en" : undefined}
                  >
                    {commit.message}
                  </span>
                </span>
                <code className="commit__sha">{commit.shortSha}</code>
                <span className="commit__arrow" aria-hidden="true">
                  ↗
                </span>
                <span className="sr-only">
                  {" "}
                  — ouvrir ce commit sur GitHub dans un nouvel onglet
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}

      {state.status === "ready" && commits.length === 0 && (
        <p className="statusLine">Aucun commit public récent à afficher.</p>
      )}

      <p className="section__more">
        <a className="textLink" href={content.githubUrl} target="_blank" rel="noopener noreferrer">
          Voir tout l’historique sur GitHub
          <span className="textLink__arrow" aria-hidden="true">
            ↗
          </span>
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
      </p>
    </section>
  );
}
