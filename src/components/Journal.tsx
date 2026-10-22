import { useState } from "react";
import { content } from "../content";
import { formatDate, formatRelative, guessLanguage } from "../lib/format";
import { ContributionGraph } from "./ContributionGraph";
import type { GithubState, JournalEntry, JournalEntryKind } from "../types";

const INITIAL_VISIBLE = 4;
const PAGE_SIZE = 10;

const KIND_LABELS: Record<JournalEntryKind, string> = {
  commit: "Commit",
  pullRequest: "Pull request",
  issue: "Issue",
};

const KIND_SR_LABELS: Record<JournalEntryKind, string> = {
  commit: "ce commit",
  pullRequest: "cette pull request",
  issue: "cette issue",
};

type JournalProps = {
  state: GithubState;
};

export function Journal({ state }: JournalProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const updatedAt = state.status === "ready" ? state.data.updatedAt : null;
  const journal = state.status === "ready" ? state.data.journal : [];
  const entries = journal.slice(0, visibleCount);
  const remaining = journal.length - entries.length;
  const hasMore = remaining > 0;
  const nextBatch = Math.min(PAGE_SIZE, remaining);

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
            {journal.length === 0
              ? "Aucune activité publique récente."
              : `${entries.length < journal.length ? `${entries.length} sur ` : ""}${journal.length} activité${journal.length > 1 ? "s" : ""}`}{" "}
            · dernière lecture{" "}
            <time dateTime={updatedAt}>{formatRelative(updatedAt)}</time>
          </p>
        )}
        {state.status === "error" && (
          <p className="statusLine statusLine--error" role="status">
            Le journal n’a pas pu être lu pour le moment.{" "}
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

      {state.status === "ready" && entries.length > 0 && (
        <ol className="commitList">
          {entries.map((entry: JournalEntry) => (
            <li key={entry.id}>
              <a className="commit" href={entry.url} target="_blank" rel="noopener noreferrer">
                <span className="commit__date">
                  <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                </span>
                <span className="commit__body">
                  <span className="commit__repo">
                    {entry.repo}
                    {entry.kind !== "commit" && (
                      <span className="commit__kind">{KIND_LABELS[entry.kind]}</span>
                    )}
                  </span>
                  <span
                    className="commit__message"
                    lang={guessLanguage(entry.title) === "en" ? "en" : undefined}
                  >
                    {entry.title}
                  </span>
                </span>
                <code className="commit__sha">
                  {entry.kind === "commit" ? entry.shortSha : `#${entry.number}`}
                </code>
                <span className="commit__arrow" aria-hidden="true">
                  ↗
                </span>
                <span className="sr-only">
                  {" "}
                  — ouvrir {KIND_SR_LABELS[entry.kind]} sur GitHub dans un nouvel onglet
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}

      {state.status === "ready" && hasMore && (
        <button
          type="button"
          className="journalMore"
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
        >
          <span className="journalMore__label">Charger plus</span>
          <span className="journalMore__meta">
            {nextBatch} activité{nextBatch > 1 ? "s" : ""} de plus
          </span>
          <span className="journalMore__arrow" aria-hidden="true">
            ↓
          </span>
        </button>
      )}

      {state.status === "ready" && journal.length === 0 && (
        <p className="statusLine">Aucune activité publique récente à afficher.</p>
      )}

      <div className="section__more">
        <a className="textLink" href={content.githubUrl} target="_blank" rel="noopener noreferrer">
          Voir tout l’historique sur GitHub
          <span className="textLink__arrow" aria-hidden="true">
            ↗
          </span>
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
      </div>
    </section>
  );
}
