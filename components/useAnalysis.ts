"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalysisResult } from "@/lib/types";
import { getMockOrFallbackAnalysis } from "@/lib/mock";

const CACHE_PREFIX = "repolens_cache_";
const CLIENT_TIMEOUT_MS = 90000; // 90 seconds timeout

function mapErrorMessage(status: number, message: string = ""): string {
  const lowerMsg = message.toLowerCase();
  if (status === 404 || lowerMsg.includes("not found") || lowerMsg.includes("private")) {
    return "Repository not found or private. Please check the URL and accessibility.";
  }
  if (status === 429 || lowerMsg.includes("rate limit") || lowerMsg.includes("exceeded")) {
    return "GitHub API rate limit reached. Please set GITHUB_TOKEN in your environment or try again later.";
  }
  return message || "Failed to analyze repository. Please check your connection and try again.";
}

export function useAnalysis(repoUrl: string) {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const refetch = useCallback(() => {
    // Clear session storage cache for this repo on explicit retry
    if (typeof window !== "undefined" && repoUrl) {
      const cleanKey = `${CACHE_PREFIX}${repoUrl.toLowerCase().trim()}`;
      sessionStorage.removeItem(cleanKey);
    }
    setReloadToken((prev) => prev + 1);
  }, [repoUrl]);

  useEffect(() => {
    let isMounted = true;
    const trimmedUrl = (repoUrl || "").trim();

    if (!trimmedUrl) {
      setLoading(false);
      setError("Please provide a valid GitHub repository URL.");
      return;
    }

    // Backup demo path check
    if (trimmedUrl.toLowerCase() === "demo") {
      console.log("[useAnalysis] Instant demo mode activated.");
      setData(getMockOrFallbackAnalysis("expressjs/express"));
      setLoading(false);
      setError(null);
      return;
    }

    // Check sessionStorage cache
    const cacheKey = `${CACHE_PREFIX}${trimmedUrl.toLowerCase()}`;
    if (typeof window !== "undefined") {
      try {
        const cachedStr = sessionStorage.getItem(cacheKey);
        if (cachedStr) {
          const cachedData = JSON.parse(cachedStr) as AnalysisResult;
          console.log("[useAnalysis] Returning cached result from sessionStorage for:", trimmedUrl);
          setData(cachedData);
          setLoading(false);
          setError(null);
          return;
        }
      } catch (e) {
        console.log("[useAnalysis] Failed reading sessionStorage:", e);
      }
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("[useAnalysis] 90s client timeout reached, aborting fetch.");
      controller.abort();
    }, CLIENT_TIMEOUT_MS);

    async function fetchAnalysis() {
      try {
        console.log("[useAnalysis] POST /api/analyze for:", trimmedUrl);
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmedUrl, repoUrl: trimmedUrl }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const friendlyError = mapErrorMessage(res.status, errData.error || errData.message);
          console.log(`[useAnalysis] API Error (${res.status}): ${friendlyError}`);

          if (isMounted) {
            setError(friendlyError);
            setLoading(false);
          }
          return;
        }

        const result = (await res.json()) as AnalysisResult;
        console.log("[useAnalysis] Successfully received AnalysisResult for:", trimmedUrl);

        if (isMounted) {
          setData(result);
          setLoading(false);
          setError(null);

          // Cache in sessionStorage
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify(result));
            } catch (e) {
              console.log("[useAnalysis] Failed writing to sessionStorage:", e);
            }
          }
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (!isMounted) return;

        if (err.name === "AbortError") {
          console.log("[useAnalysis] Fetch aborted due to timeout or unmount.");
          setError("Analysis request timed out after 90 seconds. Please click retry.");
        } else {
          console.log("[useAnalysis] Exception during fetch:", err);
          setError(mapErrorMessage(0, err.message));
        }
        setLoading(false);
      }
    }

    fetchAnalysis();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [repoUrl, reloadToken]);

  return { data, loading, error, refetch };
}
