"use client";

import React from "react";
import { Architecture } from "@/lib/types";

interface ArchitectureSectionProps {
  data: Architecture | null;
  error?: string;
}

export function ArchitectureSection({ data, error }: ArchitectureSectionProps) {
  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <h3 className="font-semibold text-lg mb-2">Architecture Analysis Unavailable</h3>
        <p className="text-sm opacity-90">{error || "No architecture data could be generated for this repository."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Box */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-2">System Architecture Overview</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Folders & Purposes */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            Directory Structure & Purpose
          </h3>
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
            {data.folders.map((folder, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3"
              >
                <span className="text-cyan-400 font-mono text-sm font-semibold shrink-0">📁 {folder.path}</span>
                <span className="text-slate-300 text-xs leading-relaxed">{folder.purpose}</span>
              </div>
            ))}
          </div>

          <h4 className="text-sm font-semibold text-slate-200 mt-6 mb-2">Key Entry Points</h4>
          <div className="flex flex-wrap gap-2">
            {data.entryPoints.map((ep, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-xs">
                📄 {ep}
              </span>
            ))}
          </div>
        </div>

        {/* Execution Flow */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
            Request & Execution Flow
          </h3>
          <div className="space-y-3">
            {data.flow.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs flex items-center justify-center shrink-0 border border-violet-500/30">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-300 pt-0.5 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          {/* Mermaid Source Preview */}
          {data.mermaid && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mermaid Diagram Source</h4>
              <pre className="p-3 rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800">
                {data.mermaid}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
