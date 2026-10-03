import { AnalysisResult } from "./types";

export const mockResult: AnalysisResult = {
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
    lastPush: "2024-03-15T10:30:00.000Z",
    topics: ["express", "framework", "javascript", "node", "rest", "router"],
    defaultBranch: "master",
  },
  overview: {
    summary: "Express is a minimal and flexible Node.js web application framework providing a robust set of features for web and mobile applications.",
    purpose: "Provides a lightweight HTTP server abstraction with routing, middleware support, and response utilities for Node.js applications.",
    techStack: ["Node.js", "JavaScript", "CommonJS", "Router", "Connect Middleware"],
    keyFeatures: [
      "Robust URL and regex-based routing",
      "Composable middleware execution pipeline",
      "High performance HTTP helpers for redirects, caching, and responses",
      "Executable view engine template rendering support",
    ],
  },
  architecture: {
    summary: "Express is structured around an Application core instance, Router layer stack, Layer matchers, and sequential Middleware execution pipeline.",
    folders: [
      { path: "lib", purpose: "Core Express framework components and middleware engine" },
      { path: "lib/router", purpose: "HTTP route matching, dispatching, and layer stack management" },
      { path: "lib/middleware", purpose: "Built-in framework middleware handlers (query parser, init)" },
      { path: "test", purpose: "Comprehensive unit and integration test suite" },
      { path: "examples", purpose: "Sample usage applications and architecture patterns" },
      { path: "benchmarks", purpose: "Performance benchmarks and throughput load tests" },
    ],
    entryPoints: ["index.js", "lib/express.js", "lib/application.js"],
    flow: [
      "Node.js http.Server triggers the Express app callback upon an incoming client connection.",
      "Express application instance initializes request and response wrappers, merging prototype enhancements.",
      "Router iterates through registered Layer middleware stacks matching URL path and HTTP method.",
      "Matching route callback handler executes, passing data or errors down the pipeline with next().",
      "Route controller finalizes output and dispatches HTTP response via res.send() or res.json().",
    ],
    mermaid: `flowchart TD
    Client[Client HTTP Request] --> Server[Node.js HTTP Server]
    Server --> App[Express Application]
    App --> Router[Router Layer Stack]
    Router --> Match{Route Match Found}
    Match -->|Yes| Middleware[Middleware Pipeline]
    Match -->|No| NotFound[404 Not Found Handler]
    Middleware --> Handler[Route Controller Handler]
    Handler --> Response[HTTP Response Serializer]
    Response --> ClientRes[Client Response Sent]`,
  },
  docs: [
    {
      title: "What this project does",
      markdown: "Express acts as a minimal abstraction layer on top of the native Node.js `http` module, simplifying request handling, URL routing, middleware composition, and HTTP header management.",
    },
    {
      title: "How it works step by step",
      markdown: "When an HTTP request arrives, Express wraps the standard Node request and response streams. The request then proceeds through an ordered stack of layers and middleware registered in `lib/router/index.js`. If a route pattern matches the path and method, its handler executes and terminates the cycle with a response.",
    },
    {
      title: "Key modules and responsibilities",
      markdown: "- **`lib/express.js`**: Factory function creating Express application instances.\\n- **`lib/application.js`**: Prototype exposing `.listen()`, `.use()`, and application settings.\\n- **`lib/router`**: Houses `Router`, `Route`, and `Layer` classes implementing route evaluation.\\n- **`lib/request.js` & `lib/response.js`**: Extensions attached to Node.js `IncomingMessage` and `ServerResponse` prototypes.",
    },
    {
      title: "Configuration and environment",
      markdown: "Application settings are managed with `app.set(name, value)` and retrieved with `app.get(name)`. Common configurations include `env` (defaulting to `process.env.NODE_ENV`), `views` (template directory), `view engine`, and `trust proxy`.",
    },
  ],
  goodFirstIssues: [
    {
      title: "Clarify res.format() fallback behavior in JSDoc comments",
      url: "https://github.com/expressjs/express/issues/5210",
      source: "github-label",
      difficulty: "easy",
      why: "JSDoc improvements clarify parameter types and default fallback responses without touching execution logic.",
      filesToTouch: ["lib/response.js"],
      steps: [
        "Review JSDoc annotations in lib/response.js",
        "Document default 406 status code behavior",
        "Run npm test to ensure docs linter passes",
        "Submit pull request",
      ],
    },
    {
      title: "Add unit test for malformed query parameters in req.query",
      url: "https://github.com/expressjs/express/issues/5342",
      source: "ai-ranked",
      difficulty: "medium",
      why: "Improves test suite coverage for query parser edge cases without risk to production runtime.",
      filesToTouch: ["test/req.query.js"],
      steps: [
        "Inspect existing query tests in test/req.query.js",
        "Add test cases covering nested array query edge cases",
        "Execute mocha test/req.query.js",
        "Submit pull request",
      ],
    },
    {
      title: "Modernize legacy var declarations in examples/auth",
      url: "https://github.com/expressjs/express/issues/5401",
      source: "github-label",
      difficulty: "easy",
      why: "Updating example code to modern const/let syntax makes examples more accessible for beginners.",
      filesToTouch: ["examples/auth/index.js"],
      steps: [
        "Open examples/auth/index.js",
        "Replace legacy var with const and let",
        "Verify example by running node examples/auth/index.js",
        "Create PR with clear description",
      ],
    },
    {
      title: "Add automated check for trailing whitespace in markdown docs",
      url: null,
      source: "ai-suggested",
      difficulty: "easy",
      why: "Automated linting rule keeps documentation clean across contributor submissions.",
      filesToTouch: ["package.json", ".github/workflows/ci.yml"],
      steps: [
        "Add markdownlint script to package.json",
        "Include lint check step in GitHub Actions workflow",
        "Verify workflow syntax with actionlint",
        "Submit PR",
      ],
    },
  ],
  bugs: [
    {
      title: "Potential unhandled prototype pollution in merge utility",
      severity: "high",
      file: "lib/utils.js",
      line: 42,
      kind: "ai-review",
      description: "Deep object property cloning does not explicitly guard against __proto__ or constructor keys.",
      suggestedFix: "Add Object.prototype.hasOwnProperty checks or reject keys matching __proto__.",
    },
    {
      title: "Unhandled async rejection in custom middleware wrapper",
      severity: "medium",
      file: "lib/router/layer.js",
      line: 95,
      kind: "issue",
      description: "Route layers calling next() inside rejected promises can trigger unhandledRejection events in Node 18+.",
      suggestedFix: "Wrap middleware invocations in Promise.resolve(fn(req, res, next)).catch(next).",
    },
    {
      title: "Unescaped header value in deprecated res.send(body) error message",
      severity: "medium",
      file: "lib/response.js",
      line: 215,
      kind: "static",
      description: "Static scan identified string interpolation in error message without sanitization.",
      suggestedFix: "Escape user-controlled input or use static string error templates.",
    },
    {
      title: "TODO: Support WHATWG URL parser for absolute redirect URLs",
      severity: "low",
      file: "lib/response.js",
      line: 884,
      kind: "todo",
      description: "Legacy url.parse call marked with TODO comment for future Node.js WHATWG URL standard migration.",
      suggestedFix: "Refactor url.parse(url) to new URL(url, 'http://localhost').",
    },
    {
      title: "console.log statement left in examples/cookies",
      severity: "low",
      file: "examples/cookies/index.js",
      line: 31,
      kind: "static",
      description: "Console log call left in example script produces unwanted stdout noise during automated runs.",
      suggestedFix: "Replace raw console.log with conditional debug logger or clean it up.",
    },
  ],
  dependencies: [
    { name: "accepts", current: "1.3.8", latest: "1.3.8", status: "ok", type: "prod", ecosystem: "npm" },
    { name: "body-parser", current: "1.20.2", latest: "1.20.3", status: "minor-behind", type: "prod", ecosystem: "npm" },
    { name: "cookie", current: "0.4.2", latest: "0.7.2", status: "major-behind", type: "prod", ecosystem: "npm" },
    { name: "debug", current: "2.6.9", latest: "4.3.4", status: "major-behind", type: "prod", ecosystem: "npm" },
    { name: "escape-html", current: "1.0.3", latest: "1.0.3", status: "ok", type: "prod", ecosystem: "npm" },
    { name: "finalhandler", current: "1.2.0", latest: "1.3.1", status: "minor-behind", type: "prod", ecosystem: "npm" },
    { name: "qs", current: "6.11.0", latest: "6.13.0", status: "minor-behind", type: "prod", ecosystem: "npm" },
    { name: "mocha", current: "10.2.0", latest: "10.4.0", status: "minor-behind", type: "dev", ecosystem: "npm" },
    { name: "supertest", current: "6.3.3", latest: "7.0.0", status: "major-behind", type: "dev", ecosystem: "npm" },
    { name: "internal-benchmark-suite", current: "0.1.0", latest: null, status: "unknown", type: "dev", ecosystem: "npm" },
  ],
  readme: {
    score: 62,
    checks: [
      { label: "Project Title & Summary", passed: true, tip: "Clear repository title and descriptive summary paragraph present." },
      { label: "Installation Instructions", passed: true, tip: "npm install express command clearly documented." },
      { label: "Quickstart Code Example", passed: true, tip: "Minimal Hello World server example included." },
      { label: "Interactive or Visual Demo", passed: false, tip: "Add screenshots or an interactive online demo (e.g. StackBlitz/CodeSandbox) to increase adoption." },
      { label: "Features List", passed: true, tip: "Bullet points highlighting core features are present." },
      { label: "Contributing Guidelines", passed: false, tip: "Link directly to CONTRIBUTING.md and outline the PR submission workflow in README." },
      { label: "License & Badges", passed: true, tip: "MIT License badge and build status badges displayed." },
      { label: "API Reference Link", passed: false, tip: "Add direct link to https://expressjs.com/en/4x/api.html in the main navigation section." },
    ],
    suggestions: [
      "Add an embedded CodeSandbox or StackBlitz live link so users can run Express in the browser instantly.",
      "Include a dedicated section linking to CONTRIBUTING.md with local setup steps.",
      "Provide a TypeScript setup example in the README to assist TypeScript developers.",
      "Add table of contents to make long documentation pages easily scannable.",
    ],
    improvedSnippet: "const express = require('express');\nconst app = express();\nconst port = process.env.PORT || 3000;\n\napp.use(express.json());\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Hello from Express!' });\n});\n\napp.listen(port, () => {\n  console.log(`Server running on port ${port}`);\n});",
  },
  contributorGuide: {
    prerequisites: ["Node.js 18.x or higher", "npm 9.x or higher", "Git"],
    setupSteps: [
      "git clone https://github.com/expressjs/express.git",
      "cd express",
      "npm install",
    ],
    runTests: [
      "npm test",
      "npm run lint",
      "npm run test-ci",
    ],
    howToPickTask: "Browse issues labeled 'good first issue' or 'help wanted'. Comment on the issue to get assigned before writing code.",
    prChecklist: [
      "Ensure all mocha unit tests pass locally with npm test",
      "Add new unit tests in test/ covering your bug fix or feature",
      "Follow existing CommonJS and code style standards",
      "Write concise git commit messages following project guidelines",
    ],
  },
  errors: {},
  generatedAt: "2024-03-15T12:00:00.000Z",
};

export const MOCK_ANALYSIS_DATA: Record<string, AnalysisResult> = {
  "expressjs/express": mockResult,
};

export function getMockOrFallbackAnalysis(repoUrl: string): AnalysisResult {
  const cleanUrl = repoUrl.toLowerCase().trim().replace("https://github.com/", "");
  if (MOCK_ANALYSIS_DATA[cleanUrl]) {
    return MOCK_ANALYSIS_DATA[cleanUrl];
  }
  return mockResult;
}
