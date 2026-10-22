import { useState } from "react";
import { avatarSrcSet, avatarUrl, content } from "../content";

export function Intro() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className="intro" aria-labelledby="intro-title">
      <figure className="portrait">
        <div className="portrait__saucer">
          {imageFailed ? (
            <div className="portrait__fallback" role="img" aria-label="Avatar GitHub de lucafeine">
              <span aria-hidden="true">lf</span>
            </div>
          ) : (
            <img
              className="portrait__image"
              src={avatarUrl}
              srcSet={avatarSrcSet}
              sizes="(max-width: 40rem) 136px, 200px"
              width="480"
              height="480"
              alt="Photo de profil GitHub de lucafeine"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>
        <figcaption>
          Photo de profil lue depuis{" "}
          <a href={content.githubUrl} target="_blank" rel="noopener noreferrer">
            GitHub
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          .
        </figcaption>
      </figure>

      <div className="intro__prose">
        <h1 id="intro-title">{content.headline}</h1>
        <p className="intro__lede">{content.intro}</p>
        <p className="intro__note">
          Ce site lit l’API GitHub à chaque visite. Les dépôts et les commits affichés ici suivent
          donc le dépôt, pas une capture d’écran.
        </p>
      </div>
    </section>
  );
}
