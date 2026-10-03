export type Severity = "low" | "medium" | "high";

export interface RepoMeta {
  owner: string;
  name: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  license: string | null;
  lastPush: string;
  topics: string[];
  defaultBranch: string;
}

export interface Overview {
  summary: string;
  purpose: string;
  techStack: string[];
  keyFeatures: string[];
}

export interface Architecture {
  summary: string;
  folders: { path: string; purpose: string }[];
  entryPoints: string[];
  flow: string[];          // ordered steps: how a request/run flows through the code
  mermaid: string;         // mermaid flowchart source, "" if none
}

export interface DocSection {
  title: string;
  markdown: string;
} // e.g. "What this repo does", "How it works", "Key modules"

export interface GoodFirstIssue {
  title: string;
  url: string | null;
  source: "github-label" | "ai-ranked" | "ai-suggested";
  difficulty: "easy" | "medium";
  why: string;
  filesToTouch: string[];
  steps: string[];
}

export interface BugFinding {
  title: string;
  severity: Severity;
  file: string;
  line: number | null;
  kind: "todo" | "static" | "ai-review" | "issue";
  description: string;
  suggestedFix: string;
}

export interface DepItem {
  name: string;
  current: string;
  latest: string | null;
  status: "ok" | "minor-behind" | "major-behind" | "unknown";
  type: "prod" | "dev";
  ecosystem: "npm" | "pypi";
}

export interface ReadmeCheck {
  label: string;
  passed: boolean;
  tip: string;
}

export interface ReadmeReport {
  score: number;
  checks: ReadmeCheck[];
  suggestions: string[];
  improvedSnippet: string;
}

export interface ContributorGuide {
  prerequisites: string[];
  setupSteps: string[];
  runTests: string[];
  howToPickTask: string;
  prChecklist: string[];
}

export interface AnalysisResult {
  repo: RepoMeta;
  overview: Overview | null;
  architecture: Architecture | null;
  docs: DocSection[] | null;
  goodFirstIssues: GoodFirstIssue[] | null;
  bugs: BugFinding[] | null;
  dependencies: DepItem[] | null;
  readme: ReadmeReport | null;
  contributorGuide: ContributorGuide | null;
  errors: Record<string, string>;   // key = section name, value = error message
  generatedAt: string;
}
