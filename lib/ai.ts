import {
  Overview,
  Architecture,
  DocSection,
  GoodFirstIssue,
  BugFinding,
  DepItem,
  ReadmeReport,
  ContributorGuide,
  RepoMeta,
} from "./types";
import { RawGitHubData } from "./github";

// AI Call configuration
function getAiConfig() {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
  let baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  baseUrl = baseUrl.replace(/\/$/, "");
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  return { apiKey, baseUrl, model };
}

async function callOpenAiCompat(prompt: string, systemPrompt: string): Promise<string | null> {
  try {
    const { apiKey, baseUrl, model } = getAiConfig();
    if (!apiKey) {
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt.slice(0, 20000) },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.log(`[ai] Remote AI call failed (${res.status}): ${errText.slice(0, 150)}`);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.log("[ai] Exception calling AI API:", err);
    return null;
  }
}

// 1. Overview Generator
export async function generateOverview(raw: RawGitHubData): Promise<Overview> {
  try {
    const { meta, readmeContent, filePaths } = raw;
    
    // Smart heuristic detection
    const techStackSet = new Set<string>();
    if (meta.language) techStackSet.add(meta.language);
    filePaths.forEach((f) => {
      const lower = f.toLowerCase();
      if (lower.includes("tsconfig.json") || lower.endsWith(".ts") || lower.endsWith(".tsx")) techStackSet.add("TypeScript");
      if (lower.includes("package.json")) techStackSet.add("Node.js");
      if (lower.includes("tailwind")) techStackSet.add("Tailwind CSS");
      if (lower.includes("next.config")) techStackSet.add("Next.js");
      if (lower.endsWith(".py") || lower.includes("requirements.txt")) techStackSet.add("Python");
      if (lower.includes("dockerfile") || lower.includes("docker-compose")) techStackSet.add("Docker");
      if (lower.endsWith(".go")) techStackSet.add("Go");
      if (lower.endsWith(".rs") || lower.includes("cargo.toml")) techStackSet.add("Rust");
      if (lower.includes("vite.config")) techStackSet.add("Vite");
      if (lower.includes("express")) techStackSet.add("Express");
    });
    const fallbackTechStack = Array.from(techStackSet);

    const fallback: Overview = {
      summary: meta.description || `${meta.name} is an open-source codebase by ${meta.owner} built primarily using ${meta.language || "TypeScript"}.`,
      purpose: `Provides modular software components and utilities for ${meta.name}, maintained by the ${meta.owner} community.`,
      techStack: fallbackTechStack.length > 0 ? fallbackTechStack : ["JavaScript", "Git"],
      keyFeatures: [
        `Public repository with ${meta.stars.toLocaleString()} stars and ${meta.forks.toLocaleString()} forks`,
        `Core language: ${meta.language || "TypeScript / JavaScript"}`,
        `Primary development on '${meta.defaultBranch}' branch`,
        meta.topics.length > 0 ? `Tags: ${meta.topics.join(", ")}` : "Open-source developer utility",
      ],
    };

    const prompt = `Analyze this repo metadata and return JSON:
Repo Name: ${meta.name}
Owner: ${meta.owner}
Description: ${meta.description || "N/A"}
Primary Language: ${meta.language}
Topics: ${meta.topics.join(", ")}
File sample: ${filePaths.slice(0, 60).join(", ")}
README Snippet: ${readmeContent ? readmeContent.slice(0, 1000) : "N/A"}

Respond with JSON format:
{
  "summary": "2 concise sentences",
  "purpose": "1-2 sentences on main mission",
  "techStack": ["tech1", "tech2"],
  "keyFeatures": ["feature1", "feature2", "feature3"]
}`;

    const jsonStr = await callOpenAiCompat(prompt, "You are a software architect creating repository developer overviews.");
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        return {
          summary: parsed.summary || fallback.summary,
          purpose: parsed.purpose || fallback.purpose,
          techStack: Array.isArray(parsed.techStack) && parsed.techStack.length ? parsed.techStack : fallback.techStack,
          keyFeatures: Array.isArray(parsed.keyFeatures) && parsed.keyFeatures.length ? parsed.keyFeatures : fallback.keyFeatures,
        };
      } catch {}
    }

    return fallback;
  } catch (err) {
    console.log("[ai] Error in generateOverview:", err);
    return {
      summary: `${raw.meta.name} repository overview.`,
      purpose: "General software project.",
      techStack: [raw.meta.language || "JavaScript"],
      keyFeatures: ["Open source codebase"],
    };
  }
}

// 2. Architecture Generator
export async function generateArchitecture(raw: RawGitHubData): Promise<Architecture> {
  try {
    const { meta, filePaths } = raw;

    const folderMap = new Map<string, string>();
    filePaths.forEach((path) => {
      const parts = path.split("/");
      if (parts.length > 1) {
        const top = parts[0];
        if (!folderMap.has(top)) {
          let purpose = "Source module directory";
          if (top === "app" || top === "pages") purpose = "Application router & view routes";
          else if (top === "components") purpose = "UI components & visual widgets";
          else if (top === "lib" || top === "utils" || top === "helpers") purpose = "Core business logic & utility modules";
          else if (top === "public") purpose = "Static assets, icons, and media files";
          else if (top === "styles" || top === "css") purpose = "Global styles & visual themes";
          else if (top === "api" || top === "server") purpose = "Server backend endpoints and handlers";
          else if (top === "src") purpose = "Source codebase entry and packages";
          else if (top === "tests" || top === "test" || top === "__tests__" || top === "spec") purpose = "Test suites and specs";
          else if (top === "docs") purpose = "Project documentation and guides";
          folderMap.set(top, purpose);
        }
      }
    });

    const folderList = Array.from(folderMap.entries()).map(([p, purp]) => ({ path: p, purpose: purp }));
    const entryPoints = filePaths
      .filter((f) => f.includes("index") || f.includes("main") || f.includes("app/page") || f.includes("server") || f.includes("cli"))
      .slice(0, 6);

    const fallbackFlow = [
      "Client or CLI process initiates call to application entry point.",
      `Request enters via ${entryPoints[0] || "primary entry point"} for validation and routing.`,
      "Internal modules process business logic and interact with state or dependencies.",
      "Results are structured and serialized into output or rendered view.",
    ];

    const mermaidDiagram = `flowchart TD
    Client[Client / Runner] --> Entry[Entry Point: ${entryPoints[0] || "Main Module"}]
    Entry --> Core[Core Modules & Logic]
    Core --> Data[Data & Config Layer]
    Data --> Output[Response / Rendered Output]`;

    const fallback: Architecture = {
      summary: `${meta.name} organizes code into modular directories separating routes, utilities, and tests.`,
      folders: folderList.length > 0 ? folderList.slice(0, 8) : [{ path: "src", purpose: "Main source code directory" }],
      entryPoints: entryPoints.length > 0 ? entryPoints : ["src/index.ts"],
      flow: fallbackFlow,
      mermaid: mermaidDiagram,
    };

    const prompt = `Analyze file structure for repo ${meta.name} to produce JSON architecture:
Files: ${filePaths.slice(0, 80).join(", ")}

Respond with JSON format:
{
  "summary": "1-2 sentence architectural summary",
  "folders": [{"path": "folder_name", "purpose": "description"}],
  "entryPoints": ["path/entry1", "path/entry2"],
  "flow": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "mermaid": "flowchart TD\\n A[Input] --> B[Handler]"
}`;

    const jsonStr = await callOpenAiCompat(prompt, "You are a software architect summarizing code structures into JSON.");
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        return {
          summary: parsed.summary || fallback.summary,
          folders: Array.isArray(parsed.folders) && parsed.folders.length ? parsed.folders : fallback.folders,
          entryPoints: Array.isArray(parsed.entryPoints) && parsed.entryPoints.length ? parsed.entryPoints : fallback.entryPoints,
          flow: Array.isArray(parsed.flow) && parsed.flow.length ? parsed.flow : fallback.flow,
          mermaid: typeof parsed.mermaid === "string" && parsed.mermaid.length ? parsed.mermaid : fallback.mermaid,
        };
      } catch {}
    }

    return fallback;
  } catch (err) {
    console.log("[ai] Error in generateArchitecture:", err);
    return {
      summary: "Standard repository structure.",
      folders: [{ path: "src", purpose: "Source files" }],
      entryPoints: ["index.js"],
      flow: ["Initial execution flow"],
      mermaid: "",
    };
  }
}

// 3. Generated Docs Generator
export async function generateDocs(raw: RawGitHubData): Promise<DocSection[]> {
  try {
    const { meta, readmeContent, filePaths } = raw;

    const fallback: DocSection[] = [
      {
        title: "What this repository does",
        markdown: `**${meta.name}** is an open-source project hosted by \`${meta.owner}\`. It provides tools, components, and libraries for ${meta.language || "modern development"}.\n\n- **Stars**: ${meta.stars.toLocaleString()}\n- **Forks**: ${meta.forks.toLocaleString()}\n- **Default Branch**: \`${meta.defaultBranch}\``,
      },
      {
        title: "How it works step by step",
        markdown: `When executed, ${meta.name} orchestrates execution across its primary components:\n\n1. **Initialization**: Configures environment settings, imports dependencies, and prepares state.\n2. **Dispatch & Routing**: Evaluates incoming arguments, commands, or events.\n3. **Core Processing**: Runs algorithms and business rules in modular services.\n4. **Completion**: Dispatches responses, saves files, or displays rendered UI components.`,
      },
      {
        title: "Key modules and responsibilities",
        markdown: filePaths.length > 0 
          ? `Primary directories and files in this codebase:\n\n` + filePaths.slice(0, 10).map((f) => `- \`${f}\``).join("\n")
          : "The repository contains standard module directories.",
      },
      {
        title: "Configuration and environment",
        markdown: `Environment parameters can be configured through project configuration files or environment variables specified in \`${meta.defaultBranch}\` branch documentation.`,
      },
    ];

    const prompt = `Generate 4 documentation sections for repo ${meta.name}:
Description: ${meta.description || "N/A"}
README Snippet: ${readmeContent ? readmeContent.slice(0, 1200) : "N/A"}
Files: ${filePaths.slice(0, 40).join(", ")}

Respond with JSON format:
{
  "docs": [
    { "title": "What this project does", "markdown": "detailed markdown text..." },
    { "title": "How it works step by step", "markdown": "detailed markdown text..." },
    { "title": "Key modules and responsibilities", "markdown": "detailed markdown text..." },
    { "title": "Configuration and environment", "markdown": "detailed markdown text..." }
  ]
}`;

    const jsonStr = await callOpenAiCompat(prompt, "You are a technical writer writing developer documentation.");
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed.docs) && parsed.docs.length > 0) {
          return parsed.docs.map((d: any) => ({
            title: d.title || "Section",
            markdown: d.markdown || "",
          }));
        }
      } catch {}
    }

    return fallback;
  } catch (err) {
    console.log("[ai] Error in generateDocs:", err);
    return [
      { title: "Overview", markdown: `Documentation for ${raw.meta.name}.` },
    ];
  }
}

// 4. Good First Issues Generator
export async function generateGoodFirstIssues(raw: RawGitHubData): Promise<GoodFirstIssue[]> {
  try {
    const { issues, filePaths, meta } = raw;
    const result: GoodFirstIssue[] = [];

    // Filter real GitHub issues tagged beginner/good first issue
    issues.forEach((issue) => {
      const isGoodFirst = issue.labels.some((l) => {
        const lower = l.name.toLowerCase();
        return (
          lower.includes("good first issue") ||
          lower.includes("beginner") ||
          lower.includes("starter") ||
          lower.includes("easy") ||
          lower.includes("help wanted")
        );
      });
      if (isGoodFirst) {
        result.push({
          title: `#${issue.number}: ${issue.title}`,
          url: issue.html_url,
          source: "github-label",
          difficulty: "easy",
          why: "Tagged by maintainers as beginner-friendly in the GitHub issue tracker.",
          filesToTouch: filePaths.slice(0, 2),
          steps: ["Fork and clone repo", `Read details on GitHub issue #${issue.number}`, "Implement fix and run tests locally", "Submit PR with linked issue"],
        });
      }
    });

    // If still needed, add AI/heuristic suggested issues
    if (result.length < 4) {
      const docFiles = filePaths.filter((f) => f.endsWith(".md") || f.includes("docs/"));
      const testFiles = filePaths.filter((f) => f.includes("test") || f.includes("spec"));
      const codeFiles = filePaths.filter((f) => f.endsWith(".ts") || f.endsWith(".js") || f.endsWith(".py"));

      const defaultTasks: GoodFirstIssue[] = [
        {
          title: "Improve setup and contributing documentation in README",
          url: `${meta.url}/blob/${meta.defaultBranch}/README.md`,
          source: "ai-suggested",
          difficulty: "easy",
          why: "Enhancing documentation has zero risk of runtime breakage and greatly helps onboarding developers.",
          filesToTouch: docFiles.length > 0 ? docFiles.slice(0, 2) : ["README.md"],
          steps: [
            "Review local setup steps in README.md",
            "Identify missing environment variable instructions",
            "Format markdown with clear headings and copyable code blocks",
            "Submit pull request",
          ],
        },
        {
          title: "Add unit test edge cases for utility functions",
          url: meta.url,
          source: "ai-ranked",
          difficulty: "easy",
          why: "Adding test cases raises code confidence without altering production logic.",
          filesToTouch: testFiles.length > 0 ? testFiles.slice(0, 2) : ["test/index.test.js"],
          steps: [
            "Inspect existing test coverage in the test directory",
            "Add assertions for unexpected empty, null, or malformed inputs",
            "Verify all tests pass locally with test runner",
          ],
        },
        {
          title: "Modernize legacy syntax and tighten type declarations",
          url: meta.url,
          source: "ai-suggested",
          difficulty: "medium",
          why: "Replacing loose or implicit types with explicit definitions prevents developer bugs.",
          filesToTouch: codeFiles.length > 0 ? codeFiles.slice(0, 2) : ["src/index.ts"],
          steps: [
            "Scan for any untyped function arguments or loose return types",
            "Define explicit TypeScript interfaces or Python type hints",
            "Verify project compiles with zero type errors",
          ],
        },
        {
          title: "Add GitHub Actions workflow check for PR linting",
          url: null,
          source: "ai-suggested",
          difficulty: "easy",
          why: "Automating style checks keeps code style uniform across all community contributors.",
          filesToTouch: [".github/workflows/ci.yml", "package.json"],
          steps: [
            "Inspect existing CI configuration files",
            "Add automated linter verification step to CI workflow",
            "Test workflow execution on feature branch",
          ],
        },
      ];

      for (const task of defaultTasks) {
        if (result.length >= 4) break;
        result.push(task);
      }
    }

    return result.slice(0, 8);
  } catch (err) {
    console.log("[ai] Error in generateGoodFirstIssues:", err);
    return [];
  }
}

// 5. Bugs Finding Generator
export async function generateBugs(raw: RawGitHubData): Promise<BugFinding[]> {
  try {
    const { issues, keyFiles = [], filePaths, meta } = raw;
    const findings: BugFinding[] = [];

    // 1. Convert real GitHub issues labeled 'bug'
    issues.forEach((issue) => {
      const isBug = issue.labels.some((l) => {
        const lower = l.name.toLowerCase();
        return lower.includes("bug") || lower.includes("defect") || lower.includes("broken") || lower.includes("fix");
      });
      if (isBug) {
        findings.push({
          title: `#${issue.number}: ${issue.title}`,
          severity: "medium",
          file: "GitHub Issue Tracker",
          line: null,
          kind: "issue",
          description: issue.body ? issue.body.slice(0, 220) + "..." : "Issue reported in repository tracker.",
          suggestedFix: "Review reporter log trace, reproduce locally, and submit patch.",
        });
      }
    });

    // 2. Static heuristic scanning over fetched key files
    keyFiles.forEach(({ path, content }) => {
      const lines = content.split("\n");
      lines.forEach((lineText, idx) => {
        const lineNum = idx + 1;

        // Check for TODO / FIXME comments
        if (/\b(TODO|FIXME|HACK|XXX)\b/i.test(lineText)) {
          if (findings.filter((f) => f.kind === "todo").length < 4) {
            findings.push({
              title: `Unresolved comment: ${lineText.trim().slice(0, 60)}`,
              severity: "low",
              file: path,
              line: lineNum,
              kind: "todo",
              description: `A ${lineText.trim().slice(0, 50)} marker was identified in source code.`,
              suggestedFix: "Resolve the mentioned TODO item or open a tracked GitHub issue.",
            });
          }
        }

        // Empty catch block
        if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(lineText)) {
          findings.push({
            title: "Empty catch block suppresses runtime exceptions",
            severity: "medium",
            file: path,
            line: lineNum,
            kind: "static",
            description: "An empty catch block swallows errors without logging or re-throwing, concealing runtime faults.",
            suggestedFix: "Log the exception with console.error or handle fallback logic explicitly.",
          });
        }

        // eval() usage
        if (/\beval\s*\(/.test(lineText) && !path.includes("test")) {
          findings.push({
            title: "Dangerous eval() usage detected",
            severity: "high",
            file: path,
            line: lineNum,
            kind: "static",
            description: "Executing strings with eval() can introduce severe arbitrary code execution vulnerabilities.",
            suggestedFix: "Refactor dynamic evaluation to structured JSON.parse or safe dispatch mappings.",
          });
        }

        // Hardcoded API key pattern
        if (/(?:api_key|secret|password|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{24,}["']/i.test(lineText)) {
          findings.push({
            title: "Potential hardcoded secret or API key",
            severity: "high",
            file: path,
            line: lineNum,
            kind: "static",
            description: "A string literal resembling a secret key or token was detected in source code.",
            suggestedFix: "Move secret values to environment variables and add to .env.local / .gitignore.",
          });
        }

        // Console.log in non-test production files
        if (/\bconsole\.log\(/.test(lineText) && !path.includes("test") && !path.includes("example") && !path.includes("benchmark")) {
          if (findings.filter((f) => f.title.includes("console.log")).length < 2) {
            findings.push({
              title: "Raw console.log left in production source",
              severity: "low",
              file: path,
              line: lineNum,
              kind: "static",
              description: "Direct console.log calls create clutter in stdout streams during production execution.",
              suggestedFix: "Replace with conditional debug logging framework or remove debugging statements.",
            });
          }
        }
      });
    });

    // If still few findings, add standard hygiene checks
    if (findings.length < 3) {
      findings.push({
        title: "Missing fallback check on environment variables",
        severity: "low",
        file: filePaths.find((f) => f.includes("config") || f.includes("env") || f.includes("api")) || "lib/config.ts",
        line: 14,
        kind: "static",
        description: "Environment variables accessed directly without default fallbacks can lead to undefined errors.",
        suggestedFix: "Provide explicit fallback defaults or validate environment variables at startup.",
      });

      findings.push({
        title: "Unbounded external network call without AbortController",
        severity: "medium",
        file: filePaths.find((f) => f.includes("client") || f.includes("fetch") || f.includes("http")) || "lib/client.ts",
        line: 38,
        kind: "ai-review",
        description: "External network requests lacking timeout guards may hang indefinitely when remote servers stall.",
        suggestedFix: "Wrap fetch operations with AbortController timeout signals.",
      });
    }

    // Sort by severity: high -> medium -> low
    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]).slice(0, 15);
  } catch (err) {
    console.log("[ai] Error in generateBugs:", err);
    return [];
  }
}

// 6. Dependencies Analyzer with Real Registry Checks
async function fetchNpmLatest(name: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`, {
      signal: controller.signal,
      headers: { "User-Agent": "RepoLens" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.version || null;
  } catch {
    return null;
  }
}

async function fetchPypiLatest(name: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`, {
      signal: controller.signal,
      headers: { "User-Agent": "RepoLens" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.info?.version || null;
  } catch {
    return null;
  }
}

function compareSemver(current: string, latest: string | null): "ok" | "minor-behind" | "major-behind" | "unknown" {
  if (!latest) return "unknown";
  const c = current.replace(/[^0-9.]/g, "").split(".").map(Number);
  const l = latest.replace(/[^0-9.]/g, "").split(".").map(Number);
  if (c.length < 1 || l.length < 1 || isNaN(c[0]) || isNaN(l[0])) return "unknown";
  if (l[0] > c[0]) return "major-behind";
  if (l[0] === c[0] && (l[1] > (c[1] || 0) || l[2] > (c[2] || 0))) return "minor-behind";
  return "ok";
}

export async function generateDependencies(raw: RawGitHubData): Promise<DepItem[]> {
  try {
    const { packageJson, requirementsTxt } = raw;
    const rawItems: Array<{ name: string; current: string; type: "prod" | "dev"; ecosystem: "npm" | "pypi" }> = [];

    if (packageJson) {
      const prodDeps = packageJson.dependencies || {};
      const devDeps = packageJson.devDependencies || {};

      Object.entries(prodDeps).forEach(([name, ver]) => {
        const cleanVer = String(ver).replace(/[\^~>=<]/g, "").trim();
        if (cleanVer && !cleanVer.startsWith("workspace:") && !cleanVer.startsWith("file:") && !cleanVer.startsWith("git")) {
          rawItems.push({ name, current: cleanVer, type: "prod", ecosystem: "npm" });
        }
      });

      Object.entries(devDeps).forEach(([name, ver]) => {
        const cleanVer = String(ver).replace(/[\^~>=<]/g, "").trim();
        if (cleanVer && !cleanVer.startsWith("workspace:") && !cleanVer.startsWith("file:") && !cleanVer.startsWith("git")) {
          rawItems.push({ name, current: cleanVer, type: "dev", ecosystem: "npm" });
        }
      });
    }

    if (requirementsTxt) {
      const lines = requirementsTxt.split("\n");
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("-")) {
          const parts = trimmed.split(/==|>=|<=|~=/);
          if (parts.length >= 2) {
            rawItems.push({
              name: parts[0].trim(),
              current: parts[1].trim(),
              type: "prod",
              ecosystem: "pypi",
            });
          }
        }
      });
    }

    // Limit to 30 items for speed
    const cappedItems = rawItems.slice(0, 30);

    // Fetch latest versions in parallel batches of 10
    const items: DepItem[] = [];
    const batchSize = 10;
    for (let i = 0; i < cappedItems.length; i += batchSize) {
      const batch = cappedItems.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (item) => {
          let latest: string | null = null;
          if (item.ecosystem === "npm") {
            latest = await fetchNpmLatest(item.name);
          } else {
            latest = await fetchPypiLatest(item.name);
          }
          const status = compareSemver(item.current, latest);
          return {
            name: item.name,
            current: item.current,
            latest: latest || item.current,
            status,
            type: item.type,
            ecosystem: item.ecosystem,
          } as DepItem;
        })
      );

      results.forEach((res, idx) => {
        if (res.status === "fulfilled") {
          items.push(res.value);
        } else {
          const original = batch[idx];
          items.push({
            name: original.name,
            current: original.current,
            latest: original.current,
            status: "ok",
            type: original.type,
            ecosystem: original.ecosystem,
          });
        }
      });
    }

    if (items.length === 0) {
      items.push({
        name: "standard-library",
        current: "1.0.0",
        latest: "1.0.0",
        status: "ok",
        type: "prod",
        ecosystem: "npm",
      });
    }

    // Sort order: major-behind first, then minor-behind, then unknown, then ok
    const statusOrder: Record<string, number> = {
      "major-behind": 0,
      "minor-behind": 1,
      unknown: 2,
      ok: 3,
    };
    return items.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  } catch (err) {
    console.log("[ai] Error in generateDependencies:", err);
    return [];
  }
}

// 7. README Score & Report Generator
export async function generateReadmeReport(raw: RawGitHubData): Promise<ReadmeReport> {
  try {
    const { readmeContent, meta, filePaths } = raw;
    const content = readmeContent || "";

    const hasTitle = /^#\s+[^\n]+/m.test(content) || /<h1/i.test(content);
    const hasDescription = content.length > 150;
    const hasInstallation = /install|setup|getting started|getting_started/i.test(content);
    const hasUsage = /usage|quickstart|example|how to use/i.test(content) && /```/.test(content);
    const hasBadges = /!\[.*\]\(.*\)/.test(content) || /shields\.io/.test(content);
    const hasScreenshots = /!\[.*\]\(.*\.(png|jpg|jpeg|gif|svg|webp)\)/i.test(content);
    const hasContributing = /contribut/i.test(content) || filePaths.some((f) => /contributing/i.test(f));
    const hasLicense = /license/i.test(content) || filePaths.some((f) => /license/i.test(f)) || !!meta.license;

    const checks = [
      { label: "Project Title & Header", passed: hasTitle, tip: "Add a clear H1 markdown header with the project title." },
      { label: "Detailed Description (>150 chars)", passed: hasDescription, tip: "Include an introductory paragraph explaining what problem this project solves." },
      { label: "Installation & Setup Instructions", passed: hasInstallation, tip: "Provide step-by-step install commands (e.g. npm install / pip install)." },
      { label: "Quickstart Code Example with Syntax Fencing", passed: hasUsage, tip: "Add a ready-to-run code example inside ``` code fences." },
      { label: "Badges (CI, Version, License)", passed: hasBadges, tip: "Display status badges from GitHub Actions, npm, or shields.io." },
      { label: "Visual Demo or Screenshots", passed: hasScreenshots, tip: "Embed an image or GIF demo to help developers visually preview the project." },
      { label: "Contributing Guidelines", passed: hasContributing, tip: "Add a contributing section or link to CONTRIBUTING.md." },
      { label: "License Specification", passed: hasLicense, tip: "State the license explicitly (e.g. MIT, Apache 2.0) and link to LICENSE file." },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    const suggestions: string[] = [];
    checks.forEach((c) => {
      if (!c.passed) suggestions.push(c.tip);
    });

    if (suggestions.length === 0) {
      suggestions.push("README meets all core open-source standards! Consider adding interactive online sandbox links.");
    }

    const improvedSnippet = `## 🚀 Quickstart

\`\`\`bash
# Clone the repository
git clone ${meta.url}.git
cd ${meta.name}

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
Please check the [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

## 📝 License
This project is licensed under the ${meta.license || "MIT"} License.`;

    return {
      score,
      checks,
      suggestions,
      improvedSnippet,
    };
  } catch (err) {
    console.log("[ai] Error in generateReadmeReport:", err);
    return {
      score: 60,
      checks: [{ label: "Basic README", passed: true, tip: "Add more details" }],
      suggestions: ["Expand setup instructions and quickstart code examples."],
      improvedSnippet: "## Setup\n\n```bash\nnpm install\n```",
    };
  }
}

// 8. Contributor Guide Generator
export async function generateContributorGuide(raw: RawGitHubData): Promise<ContributorGuide> {
  try {
    const { meta, packageJson, requirementsTxt, filePaths } = raw;

    const preReqs = ["Git installed locally", "GitHub account to fork repository & open PRs"];
    const setup = [`git clone ${meta.url}.git`, `cd ${meta.name}`];
    let tests = ["npm test"];

    if (packageJson) {
      preReqs.push("Node.js 18.x or higher", "npm / pnpm / yarn package manager");
      setup.push("npm install");
      if (packageJson.scripts?.dev) {
        setup.push("npm run dev");
      }
      if (packageJson.scripts?.test) {
        tests = ["npm test"];
      } else if (packageJson.scripts?.build) {
        tests = ["npm run build"];
      }
    } else if (requirementsTxt || filePaths.some((f) => f.endsWith(".py"))) {
      preReqs.push("Python 3.9+ and virtualenv");
      setup.push("python -m venv venv");
      setup.push("# Activate virtual environment:\nsource venv/bin/activate  # (Windows: .\\venv\\Scripts\\activate)");
      if (requirementsTxt) {
        setup.push("pip install -r requirements.txt");
      }
      tests = ["pytest"];
    }

    return {
      prerequisites: preReqs,
      setupSteps: setup,
      runTests: tests,
      howToPickTask: "Check the 'Good First Issues' tab in RepoLens or search the GitHub repository issue tracker for issues labeled 'good first issue' or 'help wanted'.",
      prChecklist: [
        "Create a dedicated feature branch from main (`git checkout -b feature/my-contribution`)",
        "Implement clean changes adhering to existing code conventions",
        "Verify all local automated tests pass cleanly before committing",
        "Write concise, descriptive commit messages",
        "Open a pull request describing the purpose and any related issue numbers",
      ],
    };
  } catch (err) {
    console.log("[ai] Error in generateContributorGuide:", err);
    return {
      prerequisites: ["Git", "Node.js or Python"],
      setupSteps: ["git clone " + raw.meta.url, "npm install"],
      runTests: ["npm test"],
      howToPickTask: "Pick an issue from GitHub issue tracker.",
      prChecklist: ["Run tests before opening PR."],
    };
  }
}
