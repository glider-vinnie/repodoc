"use client";

import React, { useState } from "react";
import { BugFinding, RepoMeta, Severity } from "@/lib/types";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { SectionError } from "@/components/SectionError";
import { Bug, ChevronDown, ChevronUp, ExternalLink, ShieldAlert } from "lucide-react";

interface BugsSectionProps {
  data: BugFinding[] | null;
  repo?: RepoMeta;
  error?: string;
}

export function BugsSection({ data, repo, error }: BugsSectionProps) {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [expandedFixes, setExpandedFixes] = useState<Record<number, boolean>>({});

  if (error || !data) {
    return <SectionError title="Bug Scan Analysis Unavailable" error={error} />;
  }

  const highCount = data.filter((b) => b.severity === "high").length;
  const medCount = data.filter((b) => b.severity === "medium").length;
  const lowCount = data.filter((b) => b.severity === "low").length;

  const severityOrder: Record<Severity, number> = { high: 3, medium: 2, low: 1 };

  const filteredAndSorted = data
    .filter((b) => (severityFilter === "all" ? true : b.severity === severityFilter))
    .filter((b) => (kindFilter === "all" ? true : b.kind === kindFilter))
    .sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

  const toggleFix = (idx: number) => {
    setExpandedFixes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const buildGitHubBlobUrl = (file: string, line: number | null) => {
    if (!repo) return null;
    const branch = repo.defaultBranch || "main";
    let url = `https://github.com/${repo.owner}/${repo.name}/blob/${branch}/${file}`;
    if (line !== null && line !== undefined) {
      url += `#L${line}`;
    }
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Summary Counts Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card hoverEffect className="py-4 text-center">
          <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider block">High Severity</span>
          <span className="text-3xl font-extrabold text-rose-400 mt-1 block">{highCount}</span>
        </Card>
        <Card hoverEffect className="py-4 text-center">
          <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">Medium Severity</span>
          <span className="text-3xl font-extrabold text-amber-400 mt-1 block">{medCount}</span>
        </Card>
        <Card hoverEffect className="py-4 text-center">
          <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider block">Low Severity</span>
          <span className="text-3xl font-extrabold text-cyan-400 mt-1 block">{lowCount}</span>
        </Card>
      </div>

      {/* Filter Controls Bar */}
      <Card hoverEffect className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-rose-400" />
          <h3 className="font-bold text-white text-base">Bug Risk Scans & Issues</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {["all", "high", "medium", "low"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  severityFilter === sev
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Kind Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {["all", "static", "ai-review", "issue", "todo"].map((k) => (
              <button
                key={k}
                onClick={() => setKindFilter(k)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  kindFilter === k
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* List or EmptyState */}
      {filteredAndSorted.length === 0 ? (
        <EmptyState
          title="No Bug Findings"
          description="No bug risks or open issue scans match the selected severity and kind filters."
        />
      ) : (
        <div className="space-y-4">
          {filteredAndSorted.map((bug, idx) => {
            const blobUrl = buildGitHubBlobUrl(bug.file, bug.line);
            const isFixOpen = !!expandedFixes[idx];

            return (
              <Card key={idx} hoverEffect>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={`severity-${bug.severity}`}>
                      {bug.severity}
                    </Badge>
                    <h4 className="font-bold text-white text-base">{bug.title}</h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="neutral">{bug.kind}</Badge>
                    {blobUrl ? (
                      <a
                        href={blobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-cyan-300 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{bug.file}{bug.line ? `:${bug.line}` : ""}</span>
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                      </a>
                    ) : (
                      <span className="font-mono text-slate-400">
                        {bug.file}{bug.line ? `:${bug.line}` : ""}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed mb-3">{bug.description}</p>

                {/* Collapsible Suggested Fix */}
                {bug.suggestedFix && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => toggleFix(idx)}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors focus:outline-none"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Suggested Fix</span>
                      {isFixOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                    </button>

                    {isFixOpen && (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed">
                        {bug.suggestedFix}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
