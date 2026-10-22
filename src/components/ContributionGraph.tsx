import { useEffect, useRef } from "react";
import { content } from "../content";
import { formatDate } from "../lib/format";
import type { GithubState } from "../types";

type ContributionGraphProps = {
  state: GithubState;
};

function contributionLabel(count: number): string {
  return `${count} contribution${count > 1 ? "s" : ""}`;
}

export function ContributionGraph({ state }: ContributionGraphProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const timelineKey = state.status === "ready" ? state.data.updatedAt : state.status;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // Les semaines récentes sont à droite : on ouvre le graphique sur la période actuelle.
    scroller.scrollLeft = scroller.scrollWidth;
  }, [timelineKey]);

  if (state.status === "loading") {
    return (
      <div className="contrib contrib--placeholder">
        <p className="statusLine" role="status">
          Lecture de l’historique des contributions…
        </p>
      </div>
    );
  }

  if (state.status === "error") return null;

  const contributions = state.data.contributions;

  if (!contributions) {
    return (
      <div className="contrib contrib--placeholder">
        <p className="statusLine">
          L’historique des contributions n’a pas pu être lu.{" "}
          <a href={content.githubUrl} target="_blank" rel="noopener noreferrer">
            Voir le graphique sur GitHub
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          .
        </p>
      </div>
    );
  }

  const { total, weeks, from, to, approximate } = contributions;
  const summary = `${contributionLabel(total)} entre le ${formatDate(from)} et le ${formatDate(
    to,
  )}. Graphique des douze derniers mois.`;

  return (
    <figure className="contrib">
      <div className="contrib__head">
        <p className="contrib__total">
          <strong>{total}</strong> contribution{total > 1 ? "s" : ""}
          <span className="contrib__scope">
            {approximate ? " d’après les commits publics" : " sur les douze derniers mois"}
          </span>
        </p>
        <p className="contrib__period">
          {formatDate(from)} — {formatDate(to)}
        </p>
      </div>

      <div
        className="contrib__scroller"
        ref={scrollerRef}
        role="region"
        tabIndex={0}
        aria-label={`${summary} Les semaines les plus récentes sont à droite ; faites défiler horizontalement si nécessaire.`}
      >
        <div className="contrib__grid" aria-hidden="true">
          {weeks.map((week, weekIndex) => (
            <div className="contrib__week" key={`week-${weekIndex}`}>
              {week.map((day, dayIndex) =>
                day ? (
                  <span
                    className={`contrib__day contrib__day--level-${day.level}`}
                    key={day.date}
                    title={`${contributionLabel(day.count)} le ${formatDate(day.date)}`}
                  />
                ) : (
                  <span
                    className="contrib__day contrib__day--empty"
                    key={`empty-${weekIndex}-${dayIndex}`}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <figcaption className="contrib__legend">
        <span>Moins</span>
        <span className="contrib__day contrib__day--level-0" aria-hidden="true" />
        <span className="contrib__day contrib__day--level-1" aria-hidden="true" />
        <span className="contrib__day contrib__day--level-2" aria-hidden="true" />
        <span className="contrib__day contrib__day--level-3" aria-hidden="true" />
        <span className="contrib__day contrib__day--level-4" aria-hidden="true" />
        <span>Plus</span>
        <span className="contrib__hint">Chaque carré représente un jour.</span>
      </figcaption>
    </figure>
  );
}
