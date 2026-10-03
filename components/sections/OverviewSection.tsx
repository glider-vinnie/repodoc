"use client";

import React from "react";
import { Overview, RepoMeta } from "@/lib/types";

interface OverviewSectionProps {
  data: Overview | null;
  repo: RepoMeta;
  error?: string;
}

export function OverviewSection({ data, repo, error }: OverviewSectionProps) {
  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <h3 className="font-semibold text-lg mb-2">Overview Analysis Unavailable</h3>
        <p className="text-sm opacity-90">{error || "No overview data could be generated for this repository."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-medium">Stars</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1.5">
            <span>★</span>
            <span>{repo.stars.toLocaleString()}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-medium">Forks</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 flex items-center gap-1.5">
            <span>⑂</span>
            <span>{repo.forks.toLocaleString()}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-medium">Open Issues</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {repo.openIssues.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-medium">Language</div>
          <div className="text-2xl font-bold text-violet-400 mt-1 truncate">
            {repo.language || "TypeScript"}
          </div>
        </div>
      </div>

      {/* Main Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Repository Summary
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">{data.summary}</p>
          
          <h4 className="text-sm font-semibold text-slate-200 mt-6 mb-2">Core Mission & Purpose</h4>
          <p className="text-slate-400 text-sm leading-relaxed">{data.purpose}</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            Tech Stack Detected
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {data.techStack.map((tech, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                {tech}
              </span>
            ))}
          </div>

          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            Key Highlights
          </h3>
          <ul className="space-y-2">
            {data.keyFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
