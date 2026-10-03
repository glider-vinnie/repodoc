"use client";

import { useState, useEffect } from "react";
import { AnalysisResult } from "@/lib/types";
import { getMockOrFallbackAnalysis } from "@/lib/mock";

export function useAnalysis(repoUrl: string) {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        console.log("[useAnalysis] Fetching analysis data for:", repoUrl);
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: repoUrl }),
        });

        if (res.ok) {
          const result = await res.json();
          if (isMounted) {
            setData(result as AnalysisResult);
            setLoading(false);
          }
        } else {
          console.log("[useAnalysis] API non-200 response, using fallback mock data.");
          if (isMounted) {
            setData(getMockOrFallbackAnalysis(repoUrl));
            setLoading(false);
          }
        }
      } catch (err: any) {
        console.log("[useAnalysis] Exception fetching analysis, using fallback mock:", err);
        if (isMounted) {
          setData(getMockOrFallbackAnalysis(repoUrl));
          setLoading(false);
        }
      }
    }, 2000); // 2s delay as specified

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [repoUrl]);

  return { data, loading, error };
}
