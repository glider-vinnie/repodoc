"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { LoadingSteps } from "@/components/LoadingSteps";
import { Dashboard } from "@/components/Dashboard";
import { AnalysisResult } from "@/lib/types";
import { getMockOrFallbackAnalysis } from "@/lib/mock";

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const repoParam = searchParams.get("repo") || "expressjs/express";

  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadAnalysis() {
      try {
        console.log("[analyze] Fetching repository analysis for:", repoParam);
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: repoParam }),
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setResult(data as AnalysisResult);
          }
        } else {
          console.log("[analyze] API returned non-200, falling back to mock data");
          if (isMounted) {
            setResult(getMockOrFallbackAnalysis(repoParam));
          }
        }
      } catch (err) {
        console.log("[analyze] Error calling analyze API, using fallback mock:", err);
        if (isMounted) {
          setResult(getMockOrFallbackAnalysis(repoParam));
        }
      }
    }

    loadAnalysis();

    return () => {
      isMounted = false;
    };
  }, [repoParam]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[70vh] px-4">
            <LoadingSteps onComplete={handleLoadingComplete} />
          </div>
        ) : result ? (
          <Dashboard result={result} />
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400">Failed to load repository data.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>RepoLens • Contributor Intelligence & Dashboard</p>
      </footer>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <LoadingSteps />
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
