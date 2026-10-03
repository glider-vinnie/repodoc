import { AnalysisResult, RepoMeta } from "./types";
import { analysisCache } from "./cache";
import { parseGitHubUrl, fetchRawGitHubData, RawGitHubData } from "./github";
import {
  generateOverview,
  generateArchitecture,
  generateDocs,
  generateGoodFirstIssues,
  generateBugs,
  generateDependencies,
  generateReadmeReport,
  generateContributorGuide,
} from "./ai";

export async function analyzeRepository(inputUrl: string): Promise<AnalysisResult> {
  const generatedAt = new Date().toISOString();
  console.log(`[analyzer] Starting repository analysis for input: "${inputUrl}"`);

  // Default fallback repo meta in case GitHub fetch fails completely
  const fallbackRepoMeta: RepoMeta = {
    owner: "unknown",
    name: "unknown",
    url: inputUrl,
    description: "Repository analysis unavailable.",
    stars: 0,
    forks: 0,
    openIssues: 0,
    language: null,
    license: null,
    lastPush: generatedAt,
    topics: [],
    defaultBranch: "main",
  };

  const errors: Record<string, string> = {};

  try {
    const parsed = await parseGitHubUrl(inputUrl);
    if (!parsed) {
      console.log("[analyzer] Invalid GitHub URL format:", inputUrl);
      return {
        repo: { ...fallbackRepoMeta, description: "Invalid GitHub URL format provided." },
        overview: null,
        architecture: null,
        docs: null,
        goodFirstIssues: null,
        bugs: null,
        dependencies: null,
        readme: null,
        contributorGuide: null,
        errors: { global: "Invalid GitHub repository URL format. Please provide e.g. owner/repo or https://github.com/owner/repo" },
        generatedAt,
      };
    }

    const { owner, repo } = parsed;
    const cacheKey = `${owner}/${repo}`;

    // Check cache
    const cached = analysisCache.get(cacheKey);
    if (cached) {
      console.log(`[analyzer] Returning cached result for ${cacheKey}`);
      return cached;
    }

    console.log(`[analyzer] Fetching repository data from GitHub for ${owner}/${repo}`);
    const rawData = await fetchRawGitHubData(owner, repo);

    if (!rawData) {
      console.log(`[analyzer] Failed to fetch repository data for ${owner}/${repo}`);
      return {
        repo: { ...fallbackRepoMeta, owner, name: repo, url: `https://github.com/${owner}/${repo}` },
        overview: null,
        architecture: null,
        docs: null,
        goodFirstIssues: null,
        bugs: null,
        dependencies: null,
        readme: null,
        contributorGuide: null,
        errors: { global: `Repository "${owner}/${repo}" was not found on GitHub or is private.` },
        generatedAt,
      };
    }

    // Process each section independently with isolated try/catch blocks
    let overview = null;
    try {
      console.log("[analyzer] Analyzing section: overview");
      overview = await generateOverview(rawData);
    } catch (e: any) {
      console.log("[analyzer] Section 'overview' failed:", e);
      errors.overview = e?.message || "Failed to analyze repository overview.";
    }

    let architecture = null;
    try {
      console.log("[analyzer] Analyzing section: architecture");
      architecture = await generateArchitecture(rawData);
    } catch (e: any) {
      console.log("[analyzer] Section 'architecture' failed:", e);
      errors.architecture = e?.message || "Failed to analyze repository architecture.";
    }

    let docs = null;
    try {
      console.log("[analyzer] Analyzing section: docs");
      docs = await generateDocs(rawData);
    } catch (e: any) {
      console.log("[analyzer] Section 'docs' failed:", e);
      errors.docs = e?.message || "Failed to generate repository documentation.";
    }

    let goodFirstIssues = null;
    try {
      console.log("[analyzer] Analyzing section: goodFirstIssues");
      goodFirstIssues = await generateGoodFirstIssues(rawData);
    } catch (e: any) {
      console.log("[analyzer] Section 'goodFirstIssues' failed:", e);
      errors.goodFirstIssues = e?.message || "Failed to identify good first issues.";
    }

    let bugs = null;
    try {
      console.log("[analyzer] Analyzing section: bugs");
      bugs = await generateBugs(rawData);
    } catch (e: any) {
      console.log("[analyzer] Section 'bugs' failed:", e);
      errors.bugs = e?.message || "Failed to identify bug findings.";
    }

    let dependencies = null;
    try {
      console.log("[analyzer] Analyzing section: dependencies");
      dependencies = await generateDependencies(rawData);
    } catch (e: any) {
      console.log("[analyzer] Section 'dependencies' failed:", e);
      errors.dependencies = e?.message || "Failed to parse repository dependencies.";
    }

    let readme = null;
    try {
      console.log("[analyzer] Analyzing section: readme");
      readme = await generateReadmeReport(rawData);
    } catch (e: any) {
      console.log("[analyzer] Section 'readme' failed:", e);
      errors.readme = e?.message || "Failed to analyze README file.";
    }

    let contributorGuide = null;
    try {
      console.log("[analyzer] Analyzing section: contributorGuide");
      contributorGuide = await generateContributorGuide(rawData);
    } catch (e: any) {
      console.log("[analyzer] Section 'contributorGuide' failed:", e);
      errors.contributorGuide = e?.message || "Failed to generate contributor guide.";
    }

    const result: AnalysisResult = {
      repo: rawData.meta,
      overview,
      architecture,
      docs,
      goodFirstIssues,
      bugs,
      dependencies,
      readme,
      contributorGuide,
      errors,
      generatedAt,
    };

    // Save to cache
    analysisCache.set(cacheKey, result);
    console.log(`[analyzer] Successfully completed analysis for ${cacheKey}`);
    return result;
  } catch (err: any) {
    console.log("[analyzer] Error during repository analysis execution:", err);
    return {
      repo: fallbackRepoMeta,
      overview: null,
      architecture: null,
      docs: null,
      goodFirstIssues: null,
      bugs: null,
      dependencies: null,
      readme: null,
      contributorGuide: null,
      errors: { global: err?.message || "An unexpected error occurred during repository analysis." },
      generatedAt,
    };
  }
}
