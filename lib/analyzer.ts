import { AnalysisResult, RepoMeta } from "./types";
import { analysisCache } from "./cache";
import { parseRepoUrl, fetchRawGitHubData } from "./github";
import { mockResult } from "./mock";
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

  if (!inputUrl || typeof inputUrl !== "string") {
    throw new Error("Repository URL is required.");
  }

  const cleanInput = inputUrl.trim().toLowerCase();
  if (cleanInput === "demo") {
    console.log("[analyzer] 'demo' requested. Returning mockResult.");
    return mockResult;
  }

  const parsed = parseRepoUrl(inputUrl);
  if (!parsed) {
    console.log("[analyzer] Invalid repository URL format:", inputUrl);
    throw new Error("Invalid GitHub repository URL format. Please use 'owner/repo' or 'https://github.com/owner/repo'.");
  }

  const { owner, name: repo } = parsed;
  const cacheKey = `${owner}/${repo}`.toLowerCase();

  // Check in-memory cache
  const cached = analysisCache.get(cacheKey);
  if (cached) {
    console.log(`[analyzer] Returning cached result for ${cacheKey}`);
    return cached;
  }

  console.log(`[analyzer] Fetching repository data from GitHub for ${owner}/${repo}`);
  const rawData = await fetchRawGitHubData(owner, repo);

  if (!rawData) {
    // If demo repo expressjs/express, fallback to mockResult
    if (owner.toLowerCase() === "expressjs" && repo.toLowerCase() === "express") {
      console.log("[analyzer] Fallback to mockResult for expressjs/express");
      return mockResult;
    }

    console.log(`[analyzer] Failed to fetch repository data for ${owner}/${repo}`);
    const fallbackRepoMeta: RepoMeta = {
      owner,
      name: repo,
      url: `https://github.com/${owner}/${repo}`,
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
      errors: {
        global: `Repository "${owner}/${repo}" was not found, is private, or GitHub API rate limit was reached. Set GITHUB_TOKEN in .env.local to increase limits.`,
      },
      generatedAt,
    };
  }

  const errors: Record<string, string> = {};

  // Run all analyzers in parallel with Promise.allSettled
  const [
    overviewRes,
    archRes,
    docsRes,
    issuesRes,
    bugsRes,
    depsRes,
    readmeRes,
    guideRes,
  ] = await Promise.allSettled([
    generateOverview(rawData),
    generateArchitecture(rawData),
    generateDocs(rawData),
    generateGoodFirstIssues(rawData),
    generateBugs(rawData),
    generateDependencies(rawData),
    generateReadmeReport(rawData),
    generateContributorGuide(rawData),
  ]);

  const overview = overviewRes.status === "fulfilled" ? overviewRes.value : null;
  if (overviewRes.status === "rejected") {
    errors.overview = overviewRes.reason?.message || "Failed to generate overview.";
  }

  const architecture = archRes.status === "fulfilled" ? archRes.value : null;
  if (archRes.status === "rejected") {
    errors.architecture = archRes.reason?.message || "Failed to generate architecture.";
  }

  const docs = docsRes.status === "fulfilled" ? docsRes.value : null;
  if (docsRes.status === "rejected") {
    errors.docs = docsRes.reason?.message || "Failed to generate documentation.";
  }

  const goodFirstIssues = issuesRes.status === "fulfilled" ? issuesRes.value : null;
  if (issuesRes.status === "rejected") {
    errors.goodFirstIssues = issuesRes.reason?.message || "Failed to identify good first issues.";
  }

  const bugs = bugsRes.status === "fulfilled" ? bugsRes.value : null;
  if (bugsRes.status === "rejected") {
    errors.bugs = bugsRes.reason?.message || "Failed to analyze bug findings.";
  }

  const dependencies = depsRes.status === "fulfilled" ? depsRes.value : null;
  if (depsRes.status === "rejected") {
    errors.dependencies = depsRes.reason?.message || "Failed to analyze dependencies.";
  }

  const readme = readmeRes.status === "fulfilled" ? readmeRes.value : null;
  if (readmeRes.status === "rejected") {
    errors.readme = readmeRes.reason?.message || "Failed to evaluate README.";
  }

  const contributorGuide = guideRes.status === "fulfilled" ? guideRes.value : null;
  if (guideRes.status === "rejected") {
    errors.contributorGuide = guideRes.reason?.message || "Failed to generate contributor guide.";
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

  // Cache successful analysis
  analysisCache.set(cacheKey, result);
  console.log(`[analyzer] Successfully completed analysis for ${cacheKey}`);
  return result;
}
