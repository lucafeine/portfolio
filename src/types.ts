export type GithubProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  location: string | null;
  publicRepos: number;
  followers: number;
};

export type GithubRepo = {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  pushedAt: string | null;
  lastContributionAt: string | null;
  isFork: boolean;
  stars: number;
};

export type JournalEntryKind = "commit" | "pullRequest" | "issue";

export type JournalEntry = {
  id: string;
  kind: JournalEntryKind;
  title: string;
  date: string;
  repo: string;
  repoFullName: string;
  url: string;
  sha?: string;
  shortSha?: string;
  number?: number | null;
  state?: "open" | "closed" | "merged";
};

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionWeek = Array<ContributionDay | null>;

export type GithubContributions = {
  total: number;
  weeks: ContributionWeek[];
  from: string;
  to: string;
  approximate: boolean;
};

export type GithubPayload = {
  profile: GithubProfile;
  repos: GithubRepo[];
  journal: JournalEntry[];
  contributions: GithubContributions | null;
  updatedAt: string;
  stale: boolean;
};

export type GithubState =
  | { status: "loading"; data: null }
  | { status: "ready"; data: GithubPayload }
  | { status: "error"; data: null };
