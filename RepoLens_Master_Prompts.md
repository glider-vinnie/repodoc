# RepoLens — Master Prompt Doc (90 min, 2 people, Antigravity)

**Product:** paste a public GitHub repo URL → dashboard with docs (what/how), bugs, good first issues, README score + fixes, outdated deps, contributor guide.
**Stack:** Next.js (App Router, TypeScript) + Tailwind + Next API routes. LLM + GitHub via env vars. No database.

| Person | Owns | Folders (only touch these) |
|---|---|---|
| **P1 — Backend / Analysis engine** | GitHub fetch, analyzers, LLM, `/api/analyze` | `lib/github.ts`, `lib/llm.ts`, `lib/analyzers/*`, `lib/analyze.ts`, `app/api/**` |
| **P2 — Frontend / Product** | UI, UX, states, deploy, demo | `app/**` (except `api`), `components/**`, `styles` |

**Frozen shared files** (created by P1 in prompt 1.0, change only if both agree): `lib/types.ts`, `lib/mock.ts`.

## Timeline

| Min | P1 | P2 |
|---|---|---|
| 0–6 | 1.0 Scaffold + contract + mock, push | Create GitHub repo, add P1, get keys, pick 3 demo repos |
| 6–16 | 1.1 GitHub client | 2.1 App shell + landing |
| 16–24 | 1.2 LLM client + orchestrator | 2.2 Dashboard + Overview/Architecture/Docs tabs |
| 24–38 | 1.3 Deterministic analyzers | 2.3 Issues, Dependencies, README, Guide tabs |
| 38–55 | 1.4 LLM analyzers | 2.3 finish, then 2.4 integration (at min ~45) |
| 55–70 | 1.5 Harden on 3 repos | 2.5 Polish |
| 70–85 | Fix bugs from P2, help deploy | 2.6 Deploy + demo script |
| 85–90 | Freeze. Rehearse demo. | Freeze. Rehearse demo. |

**Sync points:** min 6 (P2 pulls scaffold) · min 24 (orchestrator live, P2 can call it) · min 45 (integration) · min 70 (feature freeze).
**Cut list if behind (drop in this order):** Mermaid diagram → README improved snippet → AI-suggested issues → contributor guide → static bug scan.

---

## SHARED — paste at the top of the FIRST prompt in your Antigravity session

```
PROJECT: RepoLens — a Next.js (App Router, TypeScript, Tailwind) web app. User pastes a public GitHub repo URL and gets a contributor-focused dashboard: overview, architecture, generated docs (what happens + how), bugs, good first issues, README score + improvement suggestions, outdated dependencies, contributor guide.

RULES:
- 90-minute hackathon MVP. Prefer simple, working, demo-able over perfect.
- No database, no auth. In-memory cache only.
- Env vars: GITHUB_TOKEN, AI_API_KEY, AI_BASE_URL (OpenAI-compatible, default https://api.openai.com/v1), AI_MODEL (default gpt-4o-mini).
- All shared data shapes live in lib/types.ts (AnalysisResult). Never change it.
- Only edit files in the folders I own (stated in the prompt). Do not touch others.
- Every function: try/catch, typed, logs with console.log("[module] ..."). Never throw to the UI; return null + error message per section.
- Only add npm packages I explicitly allow.
- Code must run immediately after you finish. Run `npm run build` to verify before saying done.
```

---

## SHARED CONTRACT — `lib/types.ts` (P1 creates in 1.0, verbatim)

```ts
export type Severity = "low" | "medium" | "high";

export interface RepoMeta {
  owner: string; name: string; url: string; description: string | null;
  stars: number; forks: number; openIssues: number; language: string | null;
  license: string | null; lastPush: string; topics: string[]; defaultBranch: string;
}
export interface Overview { summary: string; purpose: string; techStack: string[]; keyFeatures: string[]; }
export interface Architecture {
  summary: string;
  folders: { path: string; purpose: string }[];
  entryPoints: string[];
  flow: string[];          // ordered steps: how a request/run flows through the code
  mermaid: string;         // mermaid flowchart source, "" if none
}
export interface DocSection { title: string; markdown: string; } // e.g. "What this repo does", "How it works", "Key modules"
export interface GoodFirstIssue {
  title: string; url: string | null;
  source: "github-label" | "ai-ranked" | "ai-suggested";
  difficulty: "easy" | "medium"; why: string; filesToTouch: string[]; steps: string[];
}
export interface BugFinding {
  title: string; severity: Severity; file: string; line: number | null;
  kind: "todo" | "static" | "ai-review" | "issue"; description: string; suggestedFix: string;
}
export interface DepItem {
  name: string; current: string; latest: string | null;
  status: "ok" | "minor-behind" | "major-behind" | "unknown";
  type: "prod" | "dev"; ecosystem: "npm" | "pypi";
}
export interface ReadmeCheck { label: string; passed: boolean; tip: string; }
export interface ReadmeReport { score: number; checks: ReadmeCheck[]; suggestions: string[]; improvedSnippet: string; }
export interface ContributorGuide {
  prerequisites: string[]; setupSteps: string[]; runTests: string[];
  howToPickTask: string; prChecklist: string[];
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
```

**API contract:** `POST /api/analyze` body `{ "repoUrl": string }` → `AnalysisResult` (HTTP 200 even on partial failure; HTTP 400 only for invalid URL). `repoUrl: "demo"` returns the mock.

---

# PERSON 1 — Backend / Analysis Engine

### 1.0 Scaffold + contract + mock (min 0–6) — push immediately

```
[PASTE SHARED RULES BLOCK HERE]

TASK: Scaffold the project.
1. Run create-next-app in the current folder: TypeScript, Tailwind, App Router, ESLint, src dir = NO, import alias @/*.
2. Create lib/types.ts with EXACTLY the contract below (do not alter it): [PASTE lib/types.ts FROM DOC].
3. Create lib/mock.ts exporting `mockResult: AnalysisResult` — realistic, fully populated sample for repo "expressjs/express": 4 doc sections, 6 architecture folders, 5 flow steps, valid mermaid flowchart, 4 good first issues (mix of sources), 5 bugs (mix of kinds/severities), 10 deps (mix of statuses), readme score 62 with 8 checks, full contributor guide, errors = {}.
4. Create .env.example with GITHUB_TOKEN, AI_API_KEY, AI_BASE_URL, AI_MODEL.
5. Create app/api/analyze/route.ts: POST that returns mockResult. Set `export const maxDuration = 60`.
6. Add .gitignore entries for .env.local. Run npm run build.
Commit message: "scaffold + contract + mock". Stop after build passes.
```

### 1.1 GitHub client (min 6–16)

```
[SHARED RULES BLOCK — owned folders: lib/github.ts, lib/analyzers/*, lib/analyze.ts, lib/llm.ts, app/api/**]

TASK: Create lib/github.ts using native fetch only (no octokit).
Auth: header `Authorization: Bearer ${process.env.GITHUB_TOKEN}` if set; User-Agent "RepoLens".
Export:
- parseRepoUrl(url): {owner, name} | null — accepts https://github.com/o/r, with .git, trailing slash, /tree/..., or "o/r".
- getRepoMeta(owner, name): RepoMeta (from /repos/{o}/{r}).
- getTree(owner, name, branch): string[] of file paths via /git/trees/{branch}?recursive=1; filter out node_modules, dist, build, .git, lock files, images, binaries, minified; cap 1500 paths.
- getFile(owner, name, path, branch): string | null via raw.githubusercontent.com; truncate to 12,000 chars.
- getOpenIssues(owner, name): up to 60 open issues (exclude PRs) with {number,title,body(truncate 600),labels,url,comments}.
- getKeyFiles(owner, name, branch, tree): picks and fetches up to 12 key files: README, package.json / requirements.txt / pyproject.toml, main entry (index/main/app/server/cli), config files, 3 largest-importance source files from src/ lib/ app/. Returns {path, content}[].
- buildSnapshot(owner,name): runs the above in parallel (Promise.all), returns {meta, tree, keyFiles, readme, issues}. In-memory Map cache keyed owner/name, TTL 15 min.
Handle: 404 → throw Error("Repo not found or private"), 403/429 rate limit → Error("GitHub rate limit — set GITHUB_TOKEN"), empty repo.
Add a tiny test route-free script check: log summary of snapshot for expressjs/express when I run `npx tsx lib/github.ts` is NOT needed — just ensure types compile and npm run build passes.
```

### 1.2 LLM client + orchestrator (min 16–24) — unblocks P2

```
TASK: 
A) Create lib/llm.ts. Export `async function llmJSON<T>(system: string, user: string, opts?: {maxTokens?: number}): Promise<T>`.
 - POST ${AI_BASE_URL}/chat/completions with model AI_MODEL, temperature 0.2, response_format {type:"json_object"} (retry once without it if the provider rejects).
 - 45s timeout via AbortController, 1 retry on 429/5xx with 1.5s backoff.
 - Parse JSON; if it fails, strip ``` fences and extract the first {...} block; if still failing throw.
 - Log token-ish size of prompt (chars) and duration.
 - Truncate `user` to 24,000 chars.

B) Create lib/analyze.ts exporting `analyzeRepo(repoUrl): Promise<AnalysisResult>`:
 - parse URL (throw typed InvalidUrlError), buildSnapshot, then run these module functions in parallel with Promise.allSettled. Each module is imported from lib/analyzers/<name>.ts and has signature `(snapshot) => Promise<T>`:
   overview+architecture+docs → analyzers/explain.ts, issues → analyzers/issues.ts, bugs → analyzers/bugs.ts, dependencies → analyzers/deps.ts, readme → analyzers/readme.ts, contributorGuide → analyzers/guide.ts.
 - For each module that is NOT implemented yet, create the file with a stub that returns the matching slice of mockResult (from lib/mock.ts) so the app works end-to-end now.
 - Failed module → section null + errors[section] = message.
C) Update app/api/analyze/route.ts: validate body, "demo" → mockResult, InvalidUrlError → 400, else 200 with analyzeRepo result. Add a 90s overall guard.
Run npm run build. Commit "orchestrator + llm". Tell P2 it's live.
```

### 1.3 Deterministic analyzers (min 24–38)

```
TASK: Implement three analyzers (no LLM here), replacing the stubs.

1) lib/analyzers/deps.ts — `analyzeDeps(snapshot): Promise<DepItem[]>`
 - Parse package.json (dependencies + devDependencies) → npm; requirements.txt (name==x / >=x) → pypi. Skip git/file/workspace specifiers.
 - Cap 40 deps. Fetch latest from https://registry.npmjs.org/{name}/latest (version) and https://pypi.org/pypi/{name}/json (info.version) in parallel batches of 10, 5s timeout each; failure → latest=null, status "unknown".
 - Strip ^ ~ >= from current. Compare semver manually (no packages): major diff → "major-behind", minor/patch diff → "minor-behind", else "ok".
 - Sort: major-behind, minor-behind, unknown, ok.

2) lib/analyzers/readme.ts — rule-based part only, export `scoreReadme(readme: string, tree: string[]): {score:number; checks: ReadmeCheck[]}`
 Checks (each weighted, total 100): has title, has description paragraph (>100 chars), install/setup section, usage/examples with code block, badges, screenshots/demo image, table of contents (if >200 lines), contributing section or CONTRIBUTING.md in tree, license mention/LICENSE in tree, links not empty, length 500–15000 chars. Each check has a specific `tip` when failed.

3) lib/analyzers/bugs.ts — static part only, export `staticScan(snapshot): BugFinding[]`
 - Over keyFiles + up to 25 additional source files from the tree (fetch via getFile in batches): detect TODO/FIXME/HACK/XXX comments (kind "todo", low), empty catch blocks, `eval(`, hardcoded secrets patterns (api_key/password/token = "long string"), console.log in non-test src (low), `except:` bare in Python, `== None`, unused-looking `var` in JS, missing await patterns on obvious promise calls only if confident.
 - Each finding: file, line, severity, description, suggestedFix. Cap 25, dedupe by file+line.
Wire deps.ts analyzer into analyzeRepo. Run npm run build. Commit.
```

### 1.4 LLM analyzers (min 38–55)

```
TASK: Implement LLM-backed analyzers using llmJSON. Build prompts from snapshot (tree capped at 300 paths, keyFiles truncated to 3,500 chars each). Each prompt demands "Return ONLY valid JSON matching this schema" with the exact TS shape inline, and "Do not invent files that are not in the tree."

1) lib/analyzers/explain.ts → one LLM call returns {overview, architecture, docs}:
 - overview: summary, purpose, techStack, keyFeatures.
 - architecture: summary, folders (top-level + important sub-folders with purpose), entryPoints, flow (5–8 ordered steps "what happens when the app runs / a request comes in"), mermaid (valid `flowchart TD`, max 12 nodes, no special characters in labels, no parentheses).
 - docs: 4–6 DocSections: "What this project does", "How it works (step by step)", "Key modules and responsibilities", "Data / control flow", "Configuration & environment", "Extending the project". Markdown, grounded only in the provided files.
 Export function returning all three; analyzeRepo must split them into overview/architecture/docs.

2) lib/analyzers/issues.ts → GoodFirstIssue[]:
 - First take GitHub open issues labeled (case-insens.) "good first issue", "good-first-issue", "help wanted", "beginner", "easy", "starter" → source "github-label".
 - If fewer than 5: LLM ranks remaining open issues by beginner-friendliness (small scope, clear description, no deep internals) → "ai-ranked".
 - If still fewer than 5: LLM suggests tasks derived from the repo itself (missing tests, doc gaps, TODOs, README gaps, small refactors) → "ai-suggested" with url null.
 - Every item: why (1 sentence), filesToTouch (real paths from tree), 3–5 steps. Max 8 total.

3) lib/analyzers/bugs.ts → add `analyzeBugs(snapshot)`: merge staticScan() + LLM review of the 6 most important key files (find real logic bugs, unhandled errors, race conditions, security issues; each with file, line if known, severity, fix) as kind "ai-review" + open issues labeled bug as kind "issue". Dedupe, sort by severity, cap 20.

4) lib/analyzers/readme.ts → add `analyzeReadme(snapshot)`: scoreReadme() + one LLM call for `suggestions` (5–8 specific, actionable) and `improvedSnippet` (a ready-to-paste markdown block for the weakest section, e.g. Installation or Usage, based on real repo files).

5) lib/analyzers/guide.ts → ContributorGuide via LLM: prerequisites, setupSteps (exact commands inferred from package.json scripts / Makefile / README), runTests, howToPickTask, prChecklist (uses CONTRIBUTING.md if present).
Replace stubs. Run npm run build. Commit.
```

### 1.5 Harden (min 55–70)

```
TASK: Harden the backend. 
1. Write scripts/smoke.ts (run with `npx tsx scripts/smoke.ts`) that calls analyzeRepo on 3 repos (one small JS, one Python, one large like facebook/react) and prints per-section: ok/null, item counts, duration. Run it.
2. Fix every failure: JSON parse errors (tighten prompts), timeouts (reduce context), rate limits (clear error message), empty sections.
3. Ensure total latency for a mid-size repo stays under 60s: if exceeded, return partial result with timed-out sections as null and errors[section]="timed out".
4. Ensure large repos don't blow up: tree cap, file cap, token cap respected.
5. Add 1-line progress logs per module with duration.
Do not change lib/types.ts. Commit "harden".
```

---

# PERSON 2 — Frontend / Product

### 2.0 Pre-work (min 0–6, no Antigravity)
- Create GitHub repo, add P1 as collaborator, share URL.
- Get `GITHUB_TOKEN` (no scopes needed) and `AI_API_KEY`; put in `.env.local` and share with P1 via DM.
- Choose 3 demo repos: one small & friendly, one Python, one popular.
- At min 6: `git clone`, `npm i`, `npm run dev`.

### 2.1 App shell + landing (min 6–16)

```
[PASTE SHARED RULES BLOCK — owned folders: app/** (except app/api), components/**]

TASK: Build the shell using lib/types.ts and lib/mock.ts (read-only, do not modify).
Allowed new packages: react-markdown, remark-gfm, mermaid, lucide-react, clsx.
1. Design tokens in tailwind/globals.css: dark theme, slate background, one accent (indigo/violet), rounded-xl cards, subtle borders. Inter font via next/font.
2. app/page.tsx — landing: logo "RepoLens", tagline "Understand any open-source repo and make your first contribution faster.", big input for GitHub URL with validation (github.com/owner/repo or owner/repo), "Analyze" button, 3 clickable demo-repo chips (use expressjs/express, pallets/flask, and one more), and a 4-feature grid (Docs, Bugs, Good first issues, Dependencies/README).
3. Submitting navigates to /analyze?repo=<encoded url>.
4. components/LoadingSteps.tsx — animated checklist cycling through: "Fetching repository", "Reading code structure", "Generating documentation", "Scanning for bugs", "Finding good first issues", "Checking dependencies", "Scoring README".
5. components/Navbar.tsx, components/Card.tsx, components/Badge.tsx (severity/difficulty/status colors), components/EmptyState.tsx, components/SectionError.tsx.
Responsive, accessible (labels, focus rings). Run npm run build.
```

### 2.2 Dashboard + first three tabs (min 16–30)

```
TASK: Build app/analyze/page.tsx (client component) and the dashboard, using mockResult for now through a hook `useAnalysis(repoUrl)` in components/useAnalysis.ts that currently returns {data: mockResult, loading, error} after a fake 2s delay (I'll swap it for the real API later — keep that the ONLY place that fetches).
Layout:
- Header card: repo name/owner link, description, stat chips (stars, forks, open issues, language, license, last push relative time), "Analyze another" button.
- Left sticky sidebar (tabs on mobile): Overview, Architecture, Docs, Good First Issues, Bugs, Dependencies, README, Contributor Guide. Each tab shows a count badge where applicable.
- Section components in components/sections/: OverviewSection, ArchitectureSection, DocsSection.
 • Overview: summary, purpose, tech stack pills, key features list.
 • Architecture: summary, folder tree table (path + purpose, monospace), entry points, numbered flow stepper, and a Mermaid diagram rendered client-side (dynamic import, ssr:false, error fallback shows the source in a code block).
 • Docs: left mini-TOC of section titles, content rendered with react-markdown + remark-gfm, styled code blocks, "Copy markdown" and "Download all as .md" buttons (concatenate all sections).
If a section is null, render <SectionError> with data.errors[key].
Run npm run build.
```

### 2.3 Remaining tabs (min 30–45)

```
TASK: Add components/sections/: IssuesSection, BugsSection, DependenciesSection, ReadmeSection, GuideSection and wire them into the dashboard.
- IssuesSection: cards per GoodFirstIssue: title (link if url), source badge (GitHub label / AI ranked / AI suggested), difficulty badge, "why", files-to-touch as monospace chips, collapsible "How to start" numbered steps. Filter pills by source.
- BugsSection: summary row (high/medium/low counts), filter by severity and kind, list with file:line (monospace, link to GitHub blob URL: https://github.com/{owner}/{name}/blob/{defaultBranch}/{file}#L{line} when line exists), description, and "Suggested fix" collapsible. Sorted high→low.
- DependenciesSection: top stats (total, outdated, major-behind), table: name, current, latest, status badge, type, ecosystem; filter "Only outdated"; sortable by status.
- ReadmeSection: circular score gauge (SVG, color by score), checklist of checks (✓/✗ with tip on failures), suggestions list, "Improved snippet" in a code block with Copy button.
- GuideSection: prerequisites, setup steps as copyable command blocks, run tests, how to pick a task, PR checklist with interactive checkboxes (local state).
Every list has an EmptyState. Run npm run build.
```

### 2.4 Integrate real API (min 45–55)

```
TASK: Replace the mock in components/useAnalysis.ts with a real call: POST /api/analyze {repoUrl}. 
- States: loading (show LoadingSteps, advance steps on a timer every ~6s), error (friendly message + retry button; map messages: "Repo not found or private", "rate limit"), success.
- AbortController on unmount, 90s client timeout.
- Support partial results: sections with null render SectionError; the rest render normally.
- Keep a `?repo=demo` path that loads mock instantly (for backup demo).
- Cache last result per repo in sessionStorage so refresh doesn't re-run analysis.
Test against the 3 demo repos. Fix any UI crashes from unexpected/empty data (defensive optional chaining everywhere). Run npm run build.
```

### 2.5 Polish (min 55–70)

```
TASK: Polish for demo.
1. Add an "Export report" button in the header that downloads one markdown file combining overview, docs, top 10 bugs, good first issues, outdated deps, README suggestions, and contributor guide.
2. Add a "Contribution Readiness" summary strip at top of the dashboard: README score, # good first issues, # outdated deps, # high-severity bugs — each clickable to jump to its tab.
3. Skeleton loaders, smooth tab transitions, toast on copy, keyboard-accessible tabs.
4. Mobile layout check at 375px; fix overflow in tables/code blocks (horizontal scroll).
5. Favicon, page <title>/OG meta, 404 page, footer with GitHub link.
6. Remove all console errors/warnings. Run npm run build and npm run lint; fix.
```

### 2.6 Deploy + demo (min 70–85)

```
TASK: Prepare deployment and docs.
1. Write README.md for RepoLens: problem, features, screenshots placeholder, tech stack, setup (env vars), architecture diagram in mermaid, how analysis works, limitations, roadmap.
2. Verify `npm run build` passes with no type errors; add vercel.json with functions maxDuration 60 for app/api/analyze/route.ts.
3. Create a DEMO.md: 2-minute demo script — hook (problem), paste repo URL live, walk each tab in order (Docs → Good First Issues → Bugs → Dependencies → README → Guide), close with roadmap. Include the 3 pre-warmed repo URLs and the `?repo=demo` fallback.
```
Then: `vercel` → add env vars (`GITHUB_TOKEN`, `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`) → deploy → run the 3 demo repos once to warm the cache.

---

## Final checklist (min 85–90)
- [ ] Deployed URL works on all 3 demo repos
- [ ] `?repo=demo` fallback works offline
- [ ] No secrets committed (`.env.local` ignored)
- [ ] README + DEMO.md pushed
- [ ] Both people know the demo order and who speaks when
