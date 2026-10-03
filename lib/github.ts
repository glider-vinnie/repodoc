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
    "User-Agent": "RepoLens-App",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token && token.trim() !== "") {
    headers.Authorization = `token ${token.trim()}`;
  }
  return headers;
};

export async function parseGitHubUrl(inputUrl: string): Promise<{ owner: string; repo: string } | null> {
  try {
    console.log("[github] Parsing input GitHub URL/identifier:", inputUrl);
    let trimmed = inputUrl.trim().replace(/\/$/, "");
    if (trimmed.startsWith("https://github.com/")) {
      trimmed = trimmed.replace("https://github.com/", "");
    } else if (trimmed.startsWith("http://github.com/")) {
      trimmed = trimmed.replace("http://github.com/", "");
    }
    
    // Remove .git suffix if present
    if (trimmed.endsWith(".git")) {
      trimmed = trimmed.slice(0, -4);
    }

    const parts = trimmed.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
    return null;
  } catch (err) {
    console.log("[github] Error parsing GitHub URL:", err);
    return null;
  }
}

export async function fetchRepoMetadata(owner: string, repo: string): Promise<RepoMeta | null> {
  try {
    console.log(`[github] Fetching repo metadata for ${owner}/${repo}`);
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: getHeaders(),
      next: { revalidate: 3600 },
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

export async function fetchFileContent(owner: string, repo: string, path: string, branch: string = "main"): Promise<string | null> {
  try {
    console.log(`[github] Fetching file content: ${path}`);
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const res = await fetch(rawUrl, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      // try fallback without auth header or master branch
      if (branch !== "master") {
        return fetchFileContent(owner, repo, path, "master");
      }
      return null;
    }
    return await res.text();
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
      return data.tree.map((item: any) => item.path).slice(0, 300);
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
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=30`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      console.log(`[github] Issues fetch failed status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];
    
    // Filter out PRs (PRs have pull_request property in GitHub API)
    return data.filter((item: any) => !item.pull_request).map((issue: any) => ({
      number: issue.number,
      title: issue.title,
      body: issue.body || null,
      html_url: issue.html_url,
      labels: Array.isArray(issue.labels) ? issue.labels.map((l: any) => ({ name: typeof l === 'string' ? l : l.name })) : [],
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

    return {
      meta,
      readmeContent,
      packageJson,
      requirementsTxt,
      filePaths,
      issues,
    };
  } catch (err) {
    console.log("[github] Error gathering raw github data:", err);
    return null;
  }
}
