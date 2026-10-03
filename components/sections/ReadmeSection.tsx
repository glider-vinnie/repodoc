"use client";

import React, { useState } from "react";
import { ReadmeReport } from "@/lib/types";
import { Card } from "@/components/Card";
import { SectionError } from "@/components/SectionError";
import { EmptyState } from "@/components/EmptyState";
import { FileText, Copy, Check, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

interface ReadmeSectionProps {
  data: ReadmeReport | null;
  error?: string;
}

export function ReadmeSection({ data, error }: ReadmeSectionProps) {
  const [copied, setCopied] = useState<boolean>(false);

  if (error || !data) {
    return <SectionError title="README Analysis Unavailable" error={error} />;
  }

  const handleCopySnippet = () => {
    if (data.improvedSnippet) {
      navigator.clipboard.writeText(data.improvedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getGaugeColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Emerald
    if (score >= 60) return "#f59e0b"; // Amber
    return "#f43f5e"; // Rose
  };

  const gaugeColor = getGaugeColor(data.score);
  const strokeDashoffset = 283 - (283 * data.score) / 100;

  return (
    <div className="space-y-6">
      {/* Top Gauge Header */}
      <Card hoverEffect className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-2">
            <FileText className="w-4 h-4" />
            <span>README Completeness & Onboarding Audit</span>
          </div>
          <h3 className="text-2xl font-bold text-white">README Quality Score</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
            Evaluated on setup clarity, quickstart code snippets, license details, and contributor guidelines.
          </p>
        </div>

        {/* Circular SVG Score Gauge */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-slate-900 fill-none"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={gaugeColor}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-white">{data.score}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">/ 100</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checklist */}
        <Card hoverEffect>
          <h4 className="text-sm font-bold text-white mb-4">Completeness Checklist</h4>
          {data.checks.length === 0 ? (
            <EmptyState title="No Checks Found" description="Checklist results are unavailable." />
          ) : (
            <div className="space-y-3">
              {data.checks.map((chk, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className={`text-xs font-semibold ${chk.passed ? "text-slate-200" : "text-slate-400"}`}>
                      {chk.label}
                    </span>
                    {!chk.passed && (
                      <p className="text-[11px] text-amber-400 mt-0.5 leading-relaxed">{chk.tip}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Suggestions & Improved Snippet */}
        <Card hoverEffect className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-3">
              <Lightbulb className="w-4 h-4" />
              <span>Improvement Suggestions</span>
            </div>
            <ul className="space-y-2 mb-6">
              {data.suggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Suggested README Snippet</span>
              <button
                onClick={handleCopySnippet}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? "Copied!" : "Copy Snippet"}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 max-h-52">
              {data.improvedSnippet}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}
