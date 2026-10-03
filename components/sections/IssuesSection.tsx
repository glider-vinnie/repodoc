"use client";

import React, { useState } from "react";
import { GoodFirstIssue } from "@/lib/types";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { SectionError } from "@/components/SectionError";
import { ChevronDown, ChevronUp, ExternalLink, Target, FileCode } from "lucide-react";

interface IssuesSectionProps {
  data: GoodFirstIssue[] | null;
  error?: string;
}

type FilterSource = "all" | "github-label" | "ai-ranked" | "ai-suggested";

export function IssuesSection({ data, error }: IssuesSectionProps) {
  const [sourceFilter, setSourceFilter] = useState<FilterSource>("all");
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  if (error || !data) {
    return <SectionError title="Good First Issues Unavailable" error={error} />;
  }

  const filteredIssues = data.filter((issue) => {
    if (sourceFilter === "all") return true;
    return issue.source === sourceFilter;
  });

  const toggleSteps = (idx: number) => {
    setExpandedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Pills */}
      <Card hoverEffect className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-bold text-white text-base">Good First Issues for Contributors</h3>
            <p className="text-xs text-slate-400">Curated entry points for new developers</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "github-label", "ai-ranked", "ai-suggested"] as FilterSource[]).map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                sourceFilter === src
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {src.replace("-", " ")}
            </button>
          ))}
        </div>
      </Card>

      {/* Issues Grid or Empty State */}
      {filteredIssues.length === 0 ? (
        <EmptyState
          title="No Issues Match Filter"
          description={`No good first issues found matching source filter '${sourceFilter}'.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIssues.map((issue, idx) => {
            const isStepsOpen = !!expandedSteps[idx];
            return (
              <Card key={idx} hoverEffect className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-bold text-white text-base leading-snug">
                      {issue.url ? (
                        <a
                          href={issue.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-cyan-400 hover:underline transition-all inline-flex items-center gap-1.5"
                        >
                          <span>{issue.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </a>
                      ) : (
                        issue.title
                      )}
                    </h4>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={issue.difficulty === "easy" ? "easy" : "medium"}>
                        {issue.difficulty}
                      </Badge>
                      <Badge variant="info">
                        {issue.source.replace("-", " ")}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed mb-4">{issue.why}</p>

                  {/* Files to touch */}
                  {issue.filesToTouch.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Files to Touch:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {issue.filesToTouch.map((file, fIdx) => (
                          <span
                            key={fIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 text-cyan-300 font-mono text-[11px] border border-slate-800"
                          >
                            <FileCode className="w-3 h-3 text-cyan-400" />
                            <span>{file}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapsible How to Start */}
                {issue.steps.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => toggleSteps(idx)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none"
                    >
                      <span>How to start ({issue.steps.length} steps)</span>
                      {isStepsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isStepsOpen && (
                      <ol className="list-decimal list-inside space-y-1.5 mt-3 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                        {issue.steps.map((step, sIdx) => (
                          <li key={sIdx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
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
