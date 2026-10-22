import { useCallback, useEffect, useState } from "react";
import type { GithubPayload, GithubState } from "../types";

const REFRESH_INTERVAL = 10 * 60 * 1000;

function isPayload(value: unknown): value is GithubPayload {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<GithubPayload>;
  return (
    typeof candidate.profile === "object" &&
    candidate.profile !== null &&
    Array.isArray(candidate.repos) &&
    Array.isArray(candidate.commits) &&
    typeof candidate.updatedAt === "string"
  );
}

export function useGithubData(): GithubState {
  const [state, setState] = useState<GithubState>({ status: "loading", data: null });

  const request = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/github", {
        headers: { Accept: "application/json" },
        signal,
      });
      if (!response.ok) throw new Error(`GitHub indisponible (${response.status})`);

      const payload: unknown = await response.json();
      if (!isPayload(payload)) throw new Error("Réponse GitHub inattendue");
      if (signal?.aborted) return;

      setState({ status: "ready", data: payload });
    } catch {
      if (signal?.aborted) return;
      setState((previous) => (previous.status === "ready" ? previous : { status: "error", data: null }));
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void request(controller.signal);

    const refresh = () => {
      if (!document.hidden) void request();
    };
    const interval = window.setInterval(refresh, REFRESH_INTERVAL);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [request]);

  return state;
}
