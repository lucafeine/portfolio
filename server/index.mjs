import "dotenv/config";
import compression from "compression";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const port = Number.parseInt(process.env.PORT ?? "8787", 10);
const githubUser = (process.env.GITHUB_USER ?? "lucafeine").trim();
const githubToken = process.env.GITHUB_TOKEN?.trim();
const cacheTtlMs = Number.parseInt(process.env.CACHE_TTL_MS ?? "600000", 10);
const isProduction = process.env.NODE_ENV === "production";
const distDir = path.resolve(__dirname, "..", "dist");
const indexFile = path.join(distDir, "index.html");

if (!/^[a-zA-Z0-9-]{1,39}$/.test(githubUser)) {
  throw new Error("GITHUB_USER doit être un identifiant GitHub valide.");
}

const githubHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": `lucafeine-portfolio/1.0 (+https://lucafeine.fr)`,
  ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
};

async function githubFetch(pathname) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    headers: githubHeaders,
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    throw new Error(`GitHub ${response.status} sur ${pathname} (quota restant : ${remaining ?? "?"})`);
  }

  return response.json();
}

function firstLine(message) {
  return String(message ?? "")
    .split("\n")[0]
    .trim();
}

function levelForCount(count) {
  if (count >= 10) return 4;
  if (count >= 6) return 3;
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

function buildContributionWeeks(days) {
  const weeks = [];
  let week = [];

  if (days.length === 0) return weeks;
  const firstDay = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  for (let index = 0; index < firstDay; index += 1) week.push(null);

  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

async function loadCommitContributionFallback() {
  try {
    const pages = [1, 2, 3];
    const results = await Promise.allSettled(
      pages.map((page) =>
        githubFetch(
          `/search/commits?q=${encodeURIComponent(
            `author:${githubUser}`,
          )}&sort=author-date&order=desc&per_page=100&page=${page}`,
        ),
      ),
    );

    const countsByDate = new Map();
    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      for (const item of result.value?.items ?? []) {
        const date = item.commit?.author?.date?.slice(0, 10);
        if (!date) continue;
        countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1);
      }
    }

    if (countsByDate.size === 0) throw new Error("aucun commit trouvé");

    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 364);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());

    const days = [];
    for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const date = cursor.toISOString().slice(0, 10);
      const count = countsByDate.get(date) ?? 0;
      days.push({ date, count, level: levelForCount(count) });
    }

    return {
      total: days.reduce((sum, day) => sum + day.count, 0),
      weeks: buildContributionWeeks(days),
      from: days[0]?.date ?? null,
      to: days.at(-1)?.date ?? null,
      approximate: true,
    };
  } catch (error) {
    console.warn(`[github] graphique de contributions indisponible: ${error.message}`);
    return null;
  }
}

async function loadContributionCalendar() {
  try {
    const response = await fetch(`https://github.com/users/${githubUser}/contributions`, {
      headers: {
        Accept: "text/html",
        "Accept-Language": "en",
        "User-Agent": githubHeaders["User-Agent"],
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) throw new Error(`GitHub ${response.status}`);
    const html = await response.text();

    const countsByTooltip = new Map();
    for (const match of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const count = Number.parseInt(match[2].trim().match(/^(\d+)/)?.[1] ?? "0", 10);
      countsByTooltip.set(match[1], Number.isFinite(count) ? count : 0);
    }

    const days = [];
    for (const match of html.matchAll(/<td\b[^>]*>/g)) {
      const tag = match[0];
      if (!tag.includes("ContributionCalendar-day")) continue;

      const date = /data-date="([^"]+)"/.exec(tag)?.[1];
      if (!date) continue;

      const id = /id="([^"]+)"/.exec(tag)?.[1];
      const count = id ? (countsByTooltip.get(id) ?? 0) : 0;
      days.push({ date, count, level: levelForCount(count) });
    }

    if (days.length < 300) throw new Error(`calendrier incomplet (${days.length} jours)`);

    days.sort((a, b) => a.date.localeCompare(b.date));

    return {
      total: days.reduce((sum, day) => sum + day.count, 0),
      weeks: buildContributionWeeks(days),
      from: days[0].date,
      to: days.at(-1).date,
      approximate: false,
    };
  } catch (error) {
    console.warn(`[github] calendrier HTML indisponible (${error.message}), repli sur les commits.`);
    return loadCommitContributionFallback();
  }
}

async function loadGithubData() {
  const [profile, repos] = await Promise.all([
    githubFetch(`/users/${githubUser}`),
    githubFetch(`/users/${githubUser}/repos?per_page=100&sort=pushed`),
  ]);

  const repositories = Array.isArray(repos) ? repos : [];
  const commitSources = [...repositories]
    .sort((a, b) => Date.parse(b.pushed_at ?? 0) - Date.parse(a.pushed_at ?? 0))
    .slice(0, 15);

  const [commitResults, contributions] = await Promise.all([
    Promise.allSettled(
      commitSources.map((repo) =>
        githubFetch(
          `/repos/${githubUser}/${encodeURIComponent(repo.name)}/commits?author=${encodeURIComponent(
            githubUser,
          )}&per_page=20`,
        ),
      ),
    ),
    loadContributionCalendar(),
  ]);

  const allCommits = [];
  const latestByRepo = new Map();

  commitResults.forEach((result, index) => {
    const repo = commitSources[index];
    if (result.status === "rejected") {
      console.warn(`[github] commits indisponibles pour ${repo.name}: ${result.reason.message}`);
      return;
    }

    const commits = Array.isArray(result.value) ? result.value : [];
    if (commits.length > 0) {
      const latest = commits[0]?.commit?.author?.date ?? commits[0]?.commit?.committer?.date ?? null;
      if (latest) latestByRepo.set(repo.name, latest);
    }

    for (const commit of commits) {
      allCommits.push({
        sha: commit.sha,
        shortSha: String(commit.sha).slice(0, 7),
        message: firstLine(commit.commit?.message),
        date: commit.commit?.author?.date ?? commit.commit?.committer?.date ?? null,
        repo: repo.name,
        url: commit.html_url ?? `${repo.html_url}/commit/${commit.sha}`,
      });
    }
  });

  const seen = new Set();
  const commits = allCommits
    .filter((commit) => {
      if (!commit.date || seen.has(commit.sha)) return false;
      seen.add(commit.sha);
      return true;
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 6);

  const normalizedRepos = repositories.map((repo) => ({
    name: repo.name,
    description: repo.description ?? null,
    url: repo.html_url,
    homepage: repo.homepage || null,
    language: repo.language ?? null,
    pushedAt: repo.pushed_at ?? null,
    lastContributionAt: latestByRepo.get(repo.name) ?? null,
    isFork: Boolean(repo.fork),
    stars: repo.stargazers_count ?? 0,
  }));

  normalizedRepos.sort((a, b) => {
    const aDate = Date.parse(a.lastContributionAt ?? a.pushedAt ?? 0);
    const bDate = Date.parse(b.lastContributionAt ?? b.pushedAt ?? 0);
    return bDate - aDate;
  });

  return {
    profile: {
      login: profile.login,
      name: profile.name ?? null,
      bio: profile.bio ?? null,
      avatarUrl: profile.avatar_url,
      htmlUrl: profile.html_url,
      location: profile.location ?? null,
      publicRepos: profile.public_repos ?? normalizedRepos.length,
      followers: profile.followers ?? 0,
    },
    repos: normalizedRepos,
    commits,
    contributions,
    updatedAt: new Date().toISOString(),
    stale: false,
  };
}

let cache = { data: null, expiresAt: 0 };
let pending = null;

async function getGithubData() {
  const now = Date.now();

  if (cache.data && now < cache.expiresAt) {
    return { ...cache.data, stale: false };
  }

  if (pending) return pending;

  pending = loadGithubData()
    .then((data) => {
      cache = { data, expiresAt: Date.now() + cacheTtlMs };
      return data;
    })
    .catch((error) => {
      console.error(`[github] ${error.message}`);
      if (cache.data) {
        return { ...cache.data, stale: true };
      }
      throw error;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(compression());

app.use((request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  if (isProduction) {
    response.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "base-uri 'none'",
        "form-action 'none'",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "script-src 'self'",
        "style-src 'self'",
        "font-src 'self'",
        "img-src 'self' data: https://github.com https://avatars.githubusercontent.com",
        "connect-src 'self'",
      ].join("; "),
    );
  }

  next();
});

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    cache: cache.data ? "warm" : "cold",
  });
});

app.get("/api/github", async (_request, response) => {
  try {
    const data = await getGithubData();
    response.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    response.json(data);
  } catch {
    response.setHeader("Cache-Control", "no-store");
    response.status(503).json({
      error: "github_unavailable",
      message: "Les données GitHub sont momentanément indisponibles.",
    });
  }
});

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "not_found" });
});

if (existsSync(distDir)) {
  app.use(
    "/assets",
    express.static(path.join(distDir, "assets"), {
      immutable: true,
      maxAge: "1y",
    }),
  );

  app.use(
    express.static(distDir, {
      index: false,
      setHeaders(response, filePath) {
        if (filePath.endsWith("index.html")) {
          response.setHeader("Cache-Control", "no-cache");
        }
      },
    }),
  );

  app.use((request, response, next) => {
    if (request.method !== "GET" && request.method !== "HEAD") return next();
    if (!existsSync(indexFile)) return next();
    response.setHeader("Cache-Control", "no-cache");
    response.sendFile(indexFile);
  });
}

app.use((_request, response) => {
  if (!existsSync(distDir)) {
    response
      .status(503)
      .type("text/plain")
      .send("Le frontend n’est pas encore compilé. Lancez `npm run dev` ou `npm run build`.");
    return;
  }
  response.status(404).type("text/plain").send("Page introuvable.");
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`[server] http://127.0.0.1:${port} · GitHub @${githubUser} · cache ${cacheTtlMs / 1000}s`);
});

function shutdown(signal) {
  console.log(`[server] ${signal} reçu, arrêt propre.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
