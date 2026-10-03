"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { LoadingSteps } from "@/components/LoadingSteps";
import { Dashboard } from "@/components/Dashboard";
import { useAnalysis } from "@/components/useAnalysis";
import { Card } from "@/components/Card";
import { AlertTriangle, RefreshCw, PlayCircle, ArrowLeft } from "lucide-react";

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const repoParam = searchParams.get("repo") || "expressjs/express";

  const { data, loading, error, refetch } = useAnalysis(repoParam);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[70vh] px-4">
            <LoadingSteps />
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto px-4 pt-16">
            <Card hoverEffect className="p-8 border-rose-500/30 bg-rose-500/5 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Analysis Could Not Complete</h3>
              <p className="text-xs text-rose-300 leading-relaxed mb-6 max-w-md mx-auto">{error}</p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={refetch}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Analysis</span>
                </button>

                <Link
                  href="/analyze?repo=expressjs/express"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Load Demo (Express)</span>
                </Link>

                <Link
                  href="/"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-all border border-slate-800 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </Card>
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
