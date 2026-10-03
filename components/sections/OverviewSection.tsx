"use client";

import React from "react";
import { Overview, RepoMeta } from "@/lib/types";
import { Card } from "@/components/Card";
import { SectionError } from "@/components/SectionError";
import { CheckCircle2, Layers, Cpu, Sparkles } from "lucide-react";

interface OverviewSectionProps {
  data: Overview | null;
  repo: RepoMeta;
  error?: string;
}

export function OverviewSection({ data, repo, error }: OverviewSectionProps) {
  if (error || !data) {
    return <SectionError title="Overview Analysis Unavailable" error={error} />;
  }

  const techStack = data.techStack || [];
  const keyFeatures = data.keyFeatures || [];

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card hoverEffect>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Executive Summary</span>
        </div>
        <p className="text-slate-200 text-sm leading-relaxed font-medium">{data.summary || "Summary unavailable."}</p>
        
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Core Mission & Purpose</h4>
          <p className="text-slate-300 text-sm leading-relaxed">{data.purpose || "Purpose description unavailable."}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tech Stack Pills */}
        <Card hoverEffect>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-4">
            <Cpu className="w-4 h-4" />
            <span>Tech Stack & Languages</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.length > 0 ? (
              techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {tech}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No tech stack specified</span>
            )}
          </div>
        </Card>

        {/* Key Features List */}
        <Card hoverEffect>
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs mb-4">
            <Layers className="w-4 h-4" />
            <span>Key Features & Architecture Highlights</span>
          </div>
          {keyFeatures.length > 0 ? (
            <ul className="space-y-2.5">
              {keyFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No key features listed.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
