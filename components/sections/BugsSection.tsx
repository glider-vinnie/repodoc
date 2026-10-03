"use client";

import React from "react";
import { BugFinding } from "@/lib/types";

interface BugsSectionProps {
  data: BugFinding[] | null;
  error?: string;
}

export function BugsSection({ data, error }: BugsSectionProps) {
  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <h3 className="font-semibold text-lg mb-2">Bug Scanner Analysis Unavailable</h3>
        <p className="text-sm opacity-90">{error || "No bug findings analysis could be completed for this repository."}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
          ✓
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No Bug Findings Identified</h3>
        <p className="text-xs text-slate-400">Static checks and issue tracker scanning detected no open bug risks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Potential Bugs & Quality Scans</h3>
          <p className="text-xs text-slate-400 mt-1">Aggregated findings from open GitHub bug reports and static risk checks</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {data.length} Findings
        </span>
      </div>

      <div className="space-y-4">
        {data.map((bug, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  bug.severity === "high"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    : bug.severity === "medium"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                }`}>
                  {bug.severity} severity
                </span>
                <h4 className="font-bold text-white text-base">{bug.title}</h4>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 capitalize">
                  {bug.kind}
                </span>
                <span className="text-slate-400 font-mono">
                  {bug.file}{bug.line ? `:${bug.line}` : ""}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed mb-4">{bug.description}</p>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Suggested Fix / Resolution
              </span>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">{bug.suggestedFix}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
