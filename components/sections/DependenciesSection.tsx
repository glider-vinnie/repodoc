"use client";

import React, { useState } from "react";
import { DepItem } from "@/lib/types";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { SectionError } from "@/components/SectionError";
import { Package, ArrowUpDown, Filter } from "lucide-react";

interface DependenciesSectionProps {
  data: DepItem[] | null;
  error?: string;
}

export function DependenciesSection({ data, error }: DependenciesSectionProps) {
  const [onlyOutdated, setOnlyOutdated] = useState<boolean>(false);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  if (error || !data) {
    return <SectionError title="Dependencies Analysis Unavailable" error={error} />;
  }

  const totalCount = data.length;
  const outdatedCount = data.filter((d) => d.status !== "ok").length;
  const majorBehindCount = data.filter((d) => d.status === "major-behind").length;

  const filtered = data.filter((d) => (onlyOutdated ? d.status !== "ok" : true));

  const statusOrder: Record<string, number> = {
    "major-behind": 3,
    "minor-behind": 2,
    ok: 1,
    unknown: 0,
  };

  const sorted = [...filtered].sort((a, b) => {
    const valA = statusOrder[a.status] || 0;
    const valB = statusOrder[b.status] || 0;
    return sortAsc ? valB - valA : valA - valB;
  });

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card hoverEffect className="py-4 text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Packages</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">{totalCount}</span>
        </Card>
        <Card hoverEffect className="py-4 text-center">
          <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">Outdated</span>
          <span className="text-3xl font-extrabold text-amber-400 mt-1 block">{outdatedCount}</span>
        </Card>
        <Card hoverEffect className="py-4 text-center">
          <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider block">Major Behind</span>
          <span className="text-3xl font-extrabold text-rose-400 mt-1 block">{majorBehindCount}</span>
        </Card>
      </div>

      {/* Controls Bar */}
      <Card hoverEffect className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">Package & Dependency Manifest</h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOnlyOutdated((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all focus:outline-none ${
              onlyOutdated
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{onlyOutdated ? "Showing Outdated Only" : "Filter Outdated"}</span>
          </button>

          <button
            onClick={() => setSortAsc((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all focus:outline-none"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort by Status</span>
          </button>
        </div>
      </Card>

      {/* Dependencies Table or EmptyState */}
      {sorted.length === 0 ? (
        <EmptyState
          title="No Dependencies Match"
          description="No packages found matching the selected filter criteria."
        />
      ) : (
        <Card hoverEffect className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400 bg-slate-950/80">
                  <th className="py-3.5 px-4">Package Name</th>
                  <th className="py-3.5 px-4">Current Version</th>
                  <th className="py-3.5 px-4">Latest Version</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Ecosystem</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {sorted.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">{item.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{item.current}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{item.latest || item.current}</td>
                    <td className="py-3 px-4 capitalize">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.type === "prod"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-400">{item.ecosystem}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          item.status === "ok"
                            ? "ok"
                            : item.status === "minor-behind"
                            ? "warning"
                            : "severity-high"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
