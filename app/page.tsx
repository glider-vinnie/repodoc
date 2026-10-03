"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { RepoInput } from "@/components/RepoInput";
import { Dashboard } from "@/components/Dashboard";
import { AnalysisResult } from "@/lib/types";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setGlobalError(null);

    try {
      console.log("[page] Sending analysis request for:", url);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data?.error || "Failed to analyze repository.");
      } else {
        setResult(data as AnalysisResult);
      }
    } catch (err: any) {
      console.log("[page] Error calling analyze API:", err);
      setGlobalError(err?.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <Header />

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Banner when no result is displayed */}
        {!result && !isLoading && (
          <div className="text-center max-w-3xl mx-auto pt-16 pb-6 px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
              <span>✨ Instant Contributor Onboarding & Quality Audits</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Understand Any GitHub Repository in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400">
                Seconds
              </span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed">
              Paste any public repository URL to get a comprehensive developer dashboard: architecture breakdown, generated docs, bug scans, good first issues, README score, and contributor setup guide.
            </p>
          </div>
        )}

        <RepoInput onAnalyze={handleAnalyze} isLoading={isLoading} />

        {/* Global Error Banner */}
        {globalError && (
          <div className="w-full max-w-4xl mx-auto px-4 mb-6">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{globalError}</span>
              </div>
              <button
                onClick={() => setGlobalError(null)}
                className="text-xs text-rose-400 hover:text-rose-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Display */}
        {result && <Dashboard result={result} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        <p>RepoLens • Contributor Intelligence & Codebase Dashboard</p>
      </footer>
    </div>
  );
}
