"use client";

import React from "react";
import { DepItem } from "@/lib/types";

interface DependenciesSectionProps {
  data: DepItem[] | null;
  error?: string;
}

export function DependenciesSection({ data, error }: DependenciesSectionProps) {
  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <h3 className="font-semibold text-lg mb-2">Dependencies Analysis Unavailable</h3>
        <p className="text-sm opacity-90">{error || "No dependency manifest could be parsed for this repository."}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
        <h3 className="text-lg font-bold text-white mb-1">No Dependencies Found</h3>
        <p className="text-xs text-slate-400">No package manifest (package.json / requirements.txt) was detected in the root directory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Package & Dependency Audit</h3>
          <p className="text-xs text-slate-400 mt-1">Extracted libraries, current versions, and ecosystem classification</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
          {data.length} Packages Detected
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400 bg-slate-950/50">
              <th className="py-3 px-4">Package Name</th>
              <th className="py-3 px-4">Version</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Ecosystem</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">{item.name}</td>
                <td className="py-3 px-4 font-mono text-slate-300">{item.current}</td>
                <td className="py-3 px-4 capitalize">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    item.type === "prod" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-slate-800 text-slate-400"
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-400">{item.ecosystem}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.status === "ok"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : item.status === "minor-behind"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
