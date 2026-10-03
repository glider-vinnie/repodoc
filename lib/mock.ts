import { AnalysisResult } from "./types";

export const MOCK_ANALYSIS_DATA: Record<string, AnalysisResult> = {
  "expressjs/express": {
    repo: {
      owner: "expressjs",
      name: "express",
      url: "https://github.com/expressjs/express",
      description: "Fast, unopinionated, minimalist web framework for node.",
      stars: 64500,
      forks: 14200,
      openIssues: 120,
      language: "JavaScript",
      license: "MIT",
      lastPush: new Date().toISOString(),
      topics: ["express", "web", "framework", "javascript", "node"],
      defaultBranch: "master",
    },
    overview: {
      summary: "Express is a minimal and flexible Node.js web application framework providing a robust set of features for web and mobile applications.",
      purpose: "Provides a lightweight HTTP server abstraction with routing, middleware support, and response utilities for Node.js applications.",
      techStack: ["Node.js", "JavaScript", "HTTP", "Router"],
      keyFeatures: [
        "Robust routing mechanism for HTTP endpoints",
        "Extensible middleware pipeline execution",
        "High performance HTTP helpers (redirection, caching)",
        "Executable view engine template rendering support",
      ],
    },
    architecture: {
      summary: "Express is structured around an Application core instance, Router layer, Layer stack, and Middleware execution pipeline.",
      folders: [
        { path: "lib", purpose: "Core Express framework components and middleware engine" },
        { path: "lib/router", purpose: "HTTP route matching, dispatching, and layer stack management" },
        { path: "lib/middleware", purpose: "Built-in middleware handlers (query, init)" },
        { path: "examples", purpose: "Sample usage applications and design patterns" },
      ],
      entryPoints: ["lib/express.js", "lib/application.js", "index.js"],
      flow: [
        "Client sends an HTTP Request to the Node.js server.",
        "Express app instance receives (req, res) in handle().",
        "Router iterates through registered Layer middleware stacks.",
        "Matching route callback handler executes and sends response.",
      ],
      mermaid: `graph TD
    Client --> Server[Express App]
    Server --> Router[Router Layer Stack]
    Router --> Middleware[Middleware Pipeline]
    Middleware --> RouteHandler[Route Callback]
    RouteHandler --> Response[HTTP Response]`,
    },
    docs: [
      {
        title: "What Express Does",
        markdown: "Express acts as a minimal abstraction layer on top of Node.js `http` module, simplifying request handling, URL routing, middleware composition, and header management.",
      },
      {
        title: "How Routing Works",
        markdown: "Routes are added to the internal router stack via `app.get()`, `app.post()`, or `app.use()`. Each route registers a `Layer` containing a path regex and handler stack.",
      },
    ],
    goodFirstIssues: [
      {
        title: "Update outdated JSDoc comments in lib/router/index.js",
        url: "https://github.com/expressjs/express/issues/1",
        source: "github-label",
        difficulty: "easy",
        why: "JSDoc improvements clarify parameter types for new maintainers without touching execution logic.",
        filesToTouch: ["lib/router/index.js"],
        steps: ["Review JSDoc annotations", "Verify types match implementation", "Submit PR"],
      },
      {
        title: "Add unit test for status code edge case in res.sendStatus()",
        url: "https://github.com/expressjs/express/issues/2",
        source: "ai-ranked",
        difficulty: "easy",
        why: "Improves test suite coverage for response utility functions.",
        filesToTouch: ["test/res.sendStatus.js"],
        steps: ["Add test case assertion for invalid numeric status codes", "Run npm test"],
      },
    ],
    bugs: [
      {
        title: "Deprecated depd call warning under strict Node.js versions",
        severity: "low",
        file: "lib/application.js",
        line: 88,
        kind: "static",
        description: "Internal deprecation wrapper prints stack warnings on startup in newer Node environments.",
        suggestedFix: "Migrate internal deprecation warnings to standard process.emitWarning().",
      },
    ],
    dependencies: [
      { name: "accepts", current: "1.3.8", latest: "1.3.8", status: "ok", type: "prod", ecosystem: "npm" },
      { name: "body-parser", current: "1.20.3", latest: "1.20.3", status: "ok", type: "prod", ecosystem: "npm" },
      { name: "cookie", current: "0.7.1", latest: "0.7.1", status: "ok", type: "prod", ecosystem: "npm" },
      { name: "mocha", current: "10.2.0", latest: "10.4.0", status: "minor-behind", type: "dev", ecosystem: "npm" },
    ],
    readme: {
      score: 92,
      checks: [
        { label: "Installation instructions", passed: true, tip: "Clear npm install command present." },
        { label: "Quickstart code snippet", passed: true, tip: "Minimal Hello World app included." },
        { label: "License & Features", passed: true, tip: "MIT license specified." },
      ],
      suggestions: ["Add interactive TypeScript usage example."],
      improvedSnippet: "const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => res.send('Hello World!'));\napp.listen(3000);",
    },
    contributorGuide: {
      prerequisites: ["Node.js 18+", "npm"],
      setupSteps: ["git clone https://github.com/expressjs/express.js", "npm install"],
      runTests: ["npm test"],
      howToPickTask: "Check issues labeled 'good first issue' on GitHub.",
      prChecklist: ["Run npm test", "Ensure clean code style", "Write clear commit message"],
    },
    errors: {},
    generatedAt: new Date().toISOString(),
  },
};

export function getMockOrFallbackAnalysis(repoUrl: string): AnalysisResult {
  const cleanUrl = repoUrl.toLowerCase().trim().replace("https://github.com/", "");
  if (MOCK_ANALYSIS_DATA[cleanUrl]) {
    return MOCK_ANALYSIS_DATA[cleanUrl];
  }

  const parts = cleanUrl.split("/");
  const owner = parts[0] || "owner";
  const name = parts[1] || "repository";

  return {
    repo: {
      owner,
      name,
      url: `https://github.com/${owner}/${name}`,
      description: `${name} is an open-source codebase.`,
      stars: 1250,
      forks: 340,
      openIssues: 14,
      language: "TypeScript",
      license: "MIT",
      lastPush: new Date().toISOString(),
      topics: ["open-source", "developer-tools"],
      defaultBranch: "main",
    },
    overview: {
      summary: `${name} is an open-source project hosted on GitHub by ${owner}.`,
      purpose: "Provides core software components and tools.",
      techStack: ["TypeScript", "Node.js"],
      keyFeatures: ["Modular architecture", "Active community maintenance", "Automated test suite"],
    },
    architecture: {
      summary: `${name} uses a clean folder layout dividing source logic, assets, and tests.`,
      folders: [
        { path: "src", purpose: "Core source code directory" },
        { path: "tests", purpose: "Automated test suite" },
      ],
      entryPoints: ["src/index.ts"],
      flow: ["Client request -> Entry point -> Business logic -> Output"],
      mermaid: "graph TD\n A[Request] --> B[Entry Point]\n B --> C[Logic]",
    },
    docs: [
      { title: "What this repository does", markdown: `Overview and documentation for ${name}.` },
    ],
    goodFirstIssues: [
      {
        title: "Improve setup documentation in README.md",
        url: `https://github.com/${owner}/${name}`,
        source: "ai-suggested",
        difficulty: "easy",
        why: "Safe documentation fix for new contributors.",
        filesToTouch: ["README.md"],
        steps: ["Update README with setup instructions", "Submit pull request"],
      },
    ],
    bugs: [
      {
        title: "Missing fallback check on environment variables",
        severity: "low",
        file: "src/config.ts",
        line: 10,
        kind: "static",
        description: "Environment variables without fallback defaults may cause runtime issues.",
        suggestedFix: "Provide explicit default fallback values.",
      },
    ],
    dependencies: [
      { name: "typescript", current: "5.0.0", latest: "5.4.0", status: "minor-behind", type: "dev", ecosystem: "npm" },
    ],
    readme: {
      score: 78,
      checks: [
        { label: "Installation instructions", passed: true, tip: "Setup steps present." },
      ],
      suggestions: ["Add code usage examples."],
      improvedSnippet: `# ${name}\n\n## Quickstart\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``,
    },
    contributorGuide: {
      prerequisites: ["Git", "Node.js"],
      setupSteps: [`git clone https://github.com/${owner}/${name}.git`, "npm install"],
      runTests: ["npm test"],
      howToPickTask: "Pick an issue labeled 'good first issue'.",
      prChecklist: ["Verify tests pass before opening PR."],
    },
    errors: {},
    generatedAt: new Date().toISOString(),
  };
}
