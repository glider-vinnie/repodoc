"use client";

import React from "react";
import { Architecture } from "@/lib/types";
import { Card } from "@/components/Card";
import { SectionError } from "@/components/SectionError";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { FolderGit2, GitBranch, ArrowDownRight, Workflow } from "lucide-react";

interface ArchitectureSectionProps {
  data: Architecture | null;
  error?: string;
}

export function ArchitectureSection({ data, error }: ArchitectureSectionProps) {
  if (error || !data) {
    return <SectionError title="Architecture Analysis Unavailable" error={error} />;
  }

  const folders = data.folders || [];
  const entryPoints = data.entryPoints || [];
  const flow = data.flow || [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card hoverEffect>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-3">
          <Workflow className="w-4 h-4" />
          <span>Architectural Pattern & Organization</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{data.summary || "Architecture summary unavailable."}</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Folder Tree Table */}
        <Card hoverEffect className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-4">
              <FolderGit2 className="w-4 h-4" />
              <span>Directory Structure & Purpose</span>
            </div>

            {folders.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] uppercase font-semibold text-slate-400 bg-slate-950/80">
                      <th className="py-2.5 px-3">Path</th>
                      <th className="py-2.5 px-3">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {folders.map((folder, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold whitespace-nowrap">
                          📁 {folder.path}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{folder.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No directory structure data available.</p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Entry Points</h4>
            <div className="flex flex-wrap gap-2">
              {entryPoints.length > 0 ? (
                entryPoints.map((ep, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-xs"
                  >
                    <GitBranch className="w-3 h-3 text-indigo-400" />
                    <span>{ep}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No entry points specified.</span>
              )}
            </div>
          </div>
        </Card>

        {/* Numbered Flow Stepper */}
        <Card hoverEffect>
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs mb-4">
            <ArrowDownRight className="w-4 h-4" />
            <span>Execution Flow & Request Lifecycle</span>
          </div>

          {flow.length > 0 ? (
            <div className="space-y-3">
              {flow.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs flex items-center justify-center shrink-0 border border-violet-500/30">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-300 pt-0.5 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Execution flow steps unavailable.</p>
          )}

          {/* Client-rendered Mermaid diagram */}
          {data.mermaid && (
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System Flowchart</h4>
              <MermaidDiagram chart={data.mermaid} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
