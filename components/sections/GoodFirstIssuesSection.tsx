"use client";

import React from "react";
import { GoodFirstIssue } from "@/lib/types";

interface GoodFirstIssuesSectionProps {
  data: GoodFirstIssue[] | null;
  error?: string;
}

export function GoodFirstIssuesSection({ data, error }: GoodFirstIssuesSectionProps) {
  if (error || !data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <h3 className="font-semibold text-lg mb-2">Good First Issues Unavailable</h3>
        <p className="text-sm opacity-90">{error || "No good first issues could be identified for this repository."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Good First Issues for Contributors</h3>
          <p className="text-xs text-slate-400 mt-1">Recommended entry-level tasks for new repository contributors</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {data.length} Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((issue, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="font-bold text-white text-base leading-snug">
                  {issue.url ? (
                    <a href={issue.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 hover:underline transition-all">
                      {issue.title}
                    </a>
                  ) : (
                    issue.title
                  )}
                </h4>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                    issue.difficulty === "easy"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {issue.difficulty}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize">{issue.source.replace("-", " ")}</span>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed mb-4">{issue.why}</p>

              {issue.filesToTouch.length > 0 && (
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suggested Files to Modify:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {issue.filesToTouch.map((file, fIdx) => (
                      <span key={fIdx} className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 font-mono text-[11px] border border-slate-800">
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {issue.steps.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recommended Action Steps:</span>
                  <ol className="list-decimal list-inside space-y-1 mt-1 text-xs text-slate-400">
                    {issue.steps.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {issue.url && (
              <div className="mt-5 pt-3 border-t border-slate-800/80">
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>View Issue on GitHub</span>
                  <span>→</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
