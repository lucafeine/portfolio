import { content } from "../content";

export function Masthead() {
  const year = new Date().getFullYear();

  return (
    <header className="masthead">
      <p className="masthead__issue">
        <span>Portfolio</span>
        <span aria-hidden="true">·</span>
        <span>{year}/{year+1}</span>
      </p>

      <a className="masthead__wordmark" href="#contenu">
        lucafeine<span className="masthead__dot" aria-hidden="true">.</span>
      </a>

      <nav className="masthead__nav" aria-label="Navigation principale">
        <ul>
          {content.nav.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="masthead__rule" aria-hidden="true" />
    </header>
  );
}
