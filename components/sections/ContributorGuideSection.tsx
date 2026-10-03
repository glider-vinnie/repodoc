"use client";

import React, { useState } from "react";
import { ContributorGuide } from "@/lib/types";

interface ContributorGuideSectionProps {
  data: ContributorGuide | null;
  error?: string;
}

export function ContributorGuideSection({ data, error }: ContributorGuideSectionProps) {
  const [copied, setCopied] = useState(false);

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <h3 className="font-semibold text-lg mb-2">Contributor Guide Unavailable</h3>
        <p className="text-sm opacity-90">{error || "No contributor onboarding guide could be generated for this repository."}</p>
      </div>
    );
  }

  const handleCopySetup = () => {
    const commands = data.setupSteps.join("\n");
    navigator.clipboard.writeText(commands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">First-Time Contributor Guide</h3>
          <p className="text-xs text-slate-400 mt-1">Step-by-step instructions to get your local environment running and open your first pull request</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environment Setup */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            1. Prerequisites & Environment
          </h4>
          <ul className="space-y-2 mb-6">
            {data.prerequisites.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">2. Local Setup Commands</h4>
            <button
              onClick={handleCopySetup}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {copied ? "Copied!" : "Copy Commands"}
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 space-y-1.5 border border-slate-800">
            {data.setupSteps.map((cmd, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-600 select-none">$</span>
                <span>{cmd}</span>
              </div>
            ))}
          </div>

          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mt-6 mb-2">3. Running Verification Tests</h4>
          <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 space-y-1.5 border border-slate-800">
            {data.runTests.map((cmd, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-600 select-none">$</span>
                <span>{cmd}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Selection & PR Checklist */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
              How to Pick a Task
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed mb-6 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              {data.howToPickTask}
            </p>

            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              Pull Request Checklist
            </h4>
            <div className="space-y-2.5">
              {data.prChecklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="w-4 h-4 rounded bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-indigo-500/30 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="text-xs text-slate-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
