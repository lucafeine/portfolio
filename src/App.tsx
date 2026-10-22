import { useGithubData } from "./hooks/useGithubData";
import { Masthead } from "./components/Masthead";
import { Intro } from "./components/Intro";
import { Journal } from "./components/Journal";
import { Repos } from "./components/Repos";
import { LinksSection } from "./components/LinksSection";
import { SiteFooter } from "./components/SiteFooter";

export default function App() {
  const github = useGithubData();

  return (
    <>
      <a className="skipLink" href="#contenu">
        Aller au contenu
      </a>

      <div className="page">
        <Masthead />

        <main id="contenu" className="main" tabIndex={-1}>
          <Intro />
          <Repos state={github} />
          <Journal state={github} />
          <LinksSection />
        </main>

        <SiteFooter state={github} />
      </div>
    </>
  );
}
