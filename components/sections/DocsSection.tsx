"use client";

import React from "react";
import { DocSection } from "@/lib/types";

interface DocsSectionProps {
  data: DocSection[] | null;
  error?: string;
}

export function DocsSection({ data, error }: DocsSectionProps) {
  if (error || !data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <h3 className="font-semibold text-lg mb-2">Generated Docs Unavailable</h3>
        <p className="text-sm opacity-90">{error || "No generated documentation could be fetched for this repository."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((sec, idx) => (
        <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            {sec.title}
          </h3>
          <div className="prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-line leading-relaxed">
            {sec.markdown}
          </div>
        </div>
      ))}
    </div>
  );
}
