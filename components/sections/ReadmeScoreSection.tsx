"use client";

import React, { useState } from "react";
import { ReadmeReport } from "@/lib/types";

interface ReadmeScoreSectionProps {
  data: ReadmeReport | null;
  error?: string;
}

export function ReadmeScoreSection({ data, error }: ReadmeScoreSectionProps) {
  const [copied, setCopied] = useState(false);

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <h3 className="font-semibold text-lg mb-2">README Analysis Unavailable</h3>
        <p className="text-sm opacity-90">{error || "No README evaluation could be completed for this repository."}</p>
      </div>
    );
  }

  const handleCopy = () => {
    if (data.improvedSnippet) {
      navigator.clipboard.writeText(data.improvedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div className="space-y-6">
      {/* Score Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white">README Quality Score</h3>
          <p className="text-xs text-slate-400 mt-1">Evaluated based on completeness, structure, quickstart, and contributor onboarding clarity</p>
        </div>

        <div className={`px-6 py-4 rounded-2xl border flex items-center gap-3 ${getScoreColor(data.score)}`}>
          <div className="text-4xl font-extrabold tracking-tight">{data.score}</div>
          <div className="text-xs font-semibold uppercase tracking-wider">/ 100</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checklist */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <h4 className="text-base font-bold text-white mb-4">Completeness Checklist</h4>
          <div className="space-y-3">
            {data.checks.map((chk, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                <span className={`text-sm font-bold mt-0.5 ${chk.passed ? "text-emerald-400" : "text-slate-600"}`}>
                  {chk.passed ? "✓" : "✗"}
                </span>
                <div>
                  <div className={`text-xs font-semibold ${chk.passed ? "text-slate-200" : "text-slate-400"}`}>
                    {chk.label}
                  </div>
                  {!chk.passed && (
                    <p className="text-[11px] text-amber-400/90 mt-0.5">{chk.tip}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions & Improved Snippet */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white mb-4">Actionable Recommendations</h4>
            <ul className="space-y-2 mb-6">
              {data.suggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Suggested README Boilerplate</span>
              <button
                onClick={handleCopy}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {copied ? "Copied!" : "Copy Snippet"}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto border border-slate-800 max-h-48">
              {data.improvedSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
