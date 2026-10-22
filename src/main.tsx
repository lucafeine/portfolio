import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/fraunces/soft.css";
import "@fontsource-variable/newsreader/index.css";
import "@fontsource-variable/geist-mono/index.css";

import "../tokens.css";
import "./styles/app.css";

import App from "./App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Élément #root introuvable");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
