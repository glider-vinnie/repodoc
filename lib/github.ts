import { RepoMeta } from "./types";

export interface GitHubFileItem {
  path: string;
  type: "file" | "dir";
  size?: number;
}

export interface RawGitHubData {
  meta: RepoMeta;
  readmeContent: string | null;
  packageJson: Record<string, any> | null;
  requirementsTxt: string | null;
  filePaths: string[];
  keyFiles: Array<{ path: string; content: string }>;
  issues: Array<{
    number: number;
    title: string;
    body: string | null;
    html_url: string;
    labels: Array<{ name: string }>;
  }>;
}

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoLens",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token && token.trim() !== "") {
    headers.Authorization = `Bearer ${token.trim()}`;
  }
  return headers;
};

export function parseRepoUrl(inputUrl: string): { owner: string; name: string } | null {
  try {
    if (!inputUrl || typeof inputUrl !== "string") return null;
    let trimmed = inputUrl.trim().replace(/\/$/, "");
    if (trimmed.toLowerCase() === "demo") {
      return { owner: "expressjs", name: "express" };
    }
    // Remove protocol and domain
    trimmed = trimmed.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "");
    // Remove .git suffix
    trimmed = trimmed.replace(/\.git$/i, "");
    
    const parts = trimmed.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], name: parts[1] };
    }
    return null;
  } catch (err) {
    console.log("[github] Error parsing GitHub URL:", err);
    return null;
  }
}

export async function parseGitHubUrl(inputUrl: string): Promise<{ owner: string; repo: string } | null> {
  const parsed = parseRepoUrl(inputUrl);
  if (!parsed) return null;
  return { owner: parsed.owner, repo: parsed.name };
}

export async function fetchRepoMetadata(owner: string, repo: string): Promise<RepoMeta | null> {
  try {
    console.log(`[github] Fetching repo metadata for ${owner}/${repo}`);
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: getHeaders(),
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      console.log(`[github] Failed to fetch repo metadata. Status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return {
      owner: data.owner?.login || owner,
      name: data.name || repo,
      url: data.html_url || `https://github.com/${owner}/${repo}`,
      description: data.description || null,
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      openIssues: data.open_issues_count || 0,
      language: data.language || null,
      license: data.license?.spdx_id || data.license?.name || null,
      lastPush: data.pushed_at || new Date().toISOString(),
      topics: Array.isArray(data.topics) ? data.topics : [],
      defaultBranch: data.default_branch || "main",
    };
  } catch (err) {
    console.log("[github] Error fetching repo metadata:", err);
    return null;
  }
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch: string = "main"
): Promise<string | null> {
  try {
    console.log(`[github] Fetching file content: ${path}`);
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const res = await fetch(rawUrl, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      if (branch !== "master") {
        return fetchFileContent(owner, repo, path, "master");
      }
      return null;
    }
    const text = await res.text();
    // Cap file content to 12,000 characters
    return text.slice(0, 12000);
  } catch (err) {
    console.log(`[github] Error fetching file content for ${path}:`, err);
    return null;
  }
}

export async function fetchRepoTree(owner: string, repo: string, defaultBranch: string = "main"): Promise<string[]> {
  try {
    console.log(`[github] Fetching repo tree for ${owner}/${repo}`);
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      console.log(`[github] Tree fetch failed status ${res.status}, trying contents API`);
      return fetchRepoTreeFallback(owner, repo);
    }

    const data = await res.json();
    if (data.tree && Array.isArray(data.tree)) {
      // Filter out build artifacts, lockfiles, binaries, images, minified files
      const filtered = data.tree
        .filter((item: any) => item.type === "blob")
        .map((item: any) => item.path)
        .filter((p: string) => {
          const lower = p.toLowerCase();
          return (
            !lower.includes("node_modules/") &&
            !lower.includes("dist/") &&
            !lower.includes("build/") &&
            !lower.includes(".git/") &&
            !lower.endsWith(".lock") &&
            !lower.endsWith("-lock.json") &&
            !lower.endsWith(".png") &&
            !lower.endsWith(".jpg") &&
            !lower.endsWith(".jpeg") &&
            !lower.endsWith(".gif") &&
            !lower.endsWith(".ico") &&
            !lower.endsWith(".woff") &&
            !lower.endsWith(".woff2") &&
            !lower.endsWith(".min.js") &&
            !lower.endsWith(".min.css")
          );
        });
      return filtered.slice(0, 500);
    }
    return [];
  } catch (err) {
    console.log("[github] Error fetching repo tree:", err);
    return [];
  }
}

async function fetchRepoTreeFallback(owner: string, repo: string): Promise<string[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => item.path);
    }
    return [];
  } catch (err) {
    console.log("[github] Error in fallback contents API:", err);
    return [];
  }
}

export async function fetchRepoIssues(owner: string, repo: string): Promise<RawGitHubData["issues"]> {
  try {
    console.log(`[github] Fetching issues for ${owner}/${repo}`);
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=50`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      console.log(`[github] Issues fetch failed status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];
    
    // Filter out PRs (PRs have pull_request property in GitHub API)
    return data
      .filter((item: any) => !item.pull_request)
      .map((issue: any) => ({
        number: issue.number,
        title: issue.title,
        body: issue.body ? issue.body.slice(0, 600) : null,
        html_url: issue.html_url,
        labels: Array.isArray(issue.labels)
          ? issue.labels.map((l: any) => ({ name: typeof l === "string" ? l : l.name }))
          : [],
      }));
  } catch (err) {
    console.log("[github] Error fetching repo issues:", err);
    return [];
  }
}

export async function fetchRawGitHubData(owner: string, repo: string): Promise<RawGitHubData | null> {
  try {
    console.log(`[github] Gathering raw GitHub data for ${owner}/${repo}`);
    const meta = await fetchRepoMetadata(owner, repo);
    if (!meta) {
      console.log("[github] Repo metadata returned null");
      return null;
    }

    const [readmeContent, packageJsonRaw, requirementsTxt, filePaths, issues] = await Promise.all([
      fetchFileContent(owner, repo, "README.md", meta.defaultBranch).catch(() => null),
      fetchFileContent(owner, repo, "package.json", meta.defaultBranch).catch(() => null),
      fetchFileContent(owner, repo, "requirements.txt", meta.defaultBranch).catch(() => null),
      fetchRepoTree(owner, repo, meta.defaultBranch).catch(() => []),
      fetchRepoIssues(owner, repo).catch(() => []),
    ]);

    let packageJson: Record<string, any> | null = null;
    if (packageJsonRaw) {
      try {
        packageJson = JSON.parse(packageJsonRaw);
      } catch (e) {
        console.log("[github] Could not parse package.json as JSON");
      }
    }

    // Pick up to 5 key source files for deeper inspection
    const candidateEntryPaths = filePaths.filter((p) => {
      const lower = p.toLowerCase();
      return (
        lower === "index.js" ||
        lower === "index.ts" ||
        lower === "src/index.ts" ||
        lower === "src/index.js" ||
        lower === "main.py" ||
        lower === "app.py" ||
        lower === "app/page.tsx" ||
        lower.endsWith("/main.go") ||
        lower.startsWith("lib/") ||
        lower.startsWith("src/")
      );
    }).slice(0, 5);

    const keyFiles: Array<{ path: string; content: string }> = [];
    if (readmeContent) {
      keyFiles.push({ path: "README.md", content: readmeContent });
    }
    if (packageJsonRaw) {
      keyFiles.push({ path: "package.json", content: packageJsonRaw });
    }
    if (requirementsTxt) {
      keyFiles.push({ path: "requirements.txt", content: requirementsTxt });
    }

    await Promise.allSettled(
      candidateEntryPaths.map(async (path) => {
        const content = await fetchFileContent(owner, repo, path, meta.defaultBranch);
        if (content) {
          keyFiles.push({ path, content });
        }
      })
    );

    return {
      meta,
      readmeContent,
      packageJson,
      requirementsTxt,
      filePaths,
      keyFiles,
      issues,
    };
  } catch (err) {
    console.log("[github] Error gathering raw github data:", err);
    return null;
  }
}
