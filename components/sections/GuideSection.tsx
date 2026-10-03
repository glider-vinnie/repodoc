"use client";

import React, { useState } from "react";
import { ContributorGuide } from "@/lib/types";
import { Card } from "@/components/Card";
import { SectionError } from "@/components/SectionError";
import { EmptyState } from "@/components/EmptyState";
import { Rocket, Copy, Check, Terminal, CheckSquare } from "lucide-react";

interface GuideSectionProps {
  data: ContributorGuide | null;
  error?: string;
}

export function GuideSection({ data, error }: GuideSectionProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (error || !data) {
    return <SectionError title="Contributor Guide Unavailable" error={error} />;
  }

  const handleCopyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card hoverEffect className="py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <Rocket className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">First-Time Contributor Onboarding Guide</h3>
          <p className="text-xs text-slate-400">Step-by-step developer environment setup and PR instructions</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environment & Setup Steps */}
        <Card hoverEffect className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-white mb-3">1. Prerequisites</h4>
            <ul className="space-y-2">
              {data.prerequisites.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-indigo-400 font-bold">✓</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>2. Local Setup Commands</span>
            </h4>
            <div className="space-y-2">
              {data.setupSteps.map((cmd, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800"
                >
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <span className="text-slate-600 select-none">$</span>
                    <span>{cmd}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCommand(cmd, idx)}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">3. Verification & Test Commands</h4>
            <div className="space-y-2">
              {data.runTests.map((cmd, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800"
                >
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <span className="text-slate-600 select-none">$</span>
                    <span>{cmd}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCommand(cmd, 100 + idx)}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copy test command"
                  >
                    {copiedIndex === 100 + idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Task Guidance & PR Checklist */}
        <Card hoverEffect className="flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-3">How to Pick a Task</h4>
            <p className="text-slate-300 text-xs leading-relaxed p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-6">
              {data.howToPickTask}
            </p>

            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span>Pull Request Interactive Checklist</span>
            </h4>
            <div className="space-y-2.5">
              {data.prChecklist.map((item, idx) => {
                const isChecked = !!checkedItems[idx];
                return (
                  <label
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-200"
                        : "bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs leading-relaxed select-none">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
