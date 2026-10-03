"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { LoadingSteps } from "@/components/LoadingSteps";
import { Dashboard } from "@/components/Dashboard";
import { useAnalysis } from "@/components/useAnalysis";
import { SectionError } from "@/components/SectionError";

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const repoParam = searchParams.get("repo") || "expressjs/express";

  const { data, loading, error } = useAnalysis(repoParam);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[70vh] px-4">
            <LoadingSteps />
          </div>
        ) : error ? (
          <div className="max-w-4xl mx-auto px-4 pt-12">
            <SectionError title="Failed to Load Analysis" error={error} />
          </div>
        ) : data ? (
          <Dashboard result={data} />
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400">No analysis data returned.</p>
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
