"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DocSection } from "@/lib/types";
import { Card } from "@/components/Card";
import { SectionError } from "@/components/SectionError";
import { Copy, Download, BookOpen, Check } from "lucide-react";

interface DocsSectionProps {
  data: DocSection[] | null;
  error?: string;
}

export function DocsSection({ data, error }: DocsSectionProps) {
  const [activeTitle, setActiveTitle] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  if (error || !data || data.length === 0) {
    return <SectionError title="Generated Documentation Unavailable" error={error} />;
  }

  const currentActive = activeTitle || data[0]?.title;

  const handleCopyMarkdown = () => {
    const fullMarkdown = data.map((sec) => `# ${sec.title}\n\n${sec.markdown}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const fullMarkdown = data.map((sec) => `# ${sec.title}\n\n${sec.markdown}`).join("\n\n---\n\n");
    const blob = new Blob([fullMarkdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "repolens-generated-docs.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <Card hoverEffect className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-bold text-white text-base">Generated Codebase Documentation</h3>
            <p className="text-xs text-slate-400">Synthesized overview and execution guides</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            <span>{copied ? "Copied All" : "Copy Markdown"}</span>
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Mini-TOC Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-2 mb-2">
            Table of Contents
          </span>
          {data.map((sec, idx) => {
            const isActive = currentActive === sec.title;
            return (
              <button
                key={idx}
                onClick={() => setActiveTitle(sec.title)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80"
                }`}
              >
                {sec.title}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {data
            .filter((sec) => sec.title === currentActive)
            .map((sec, idx) => (
              <Card key={idx} hoverEffect className="space-y-4">
                <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">{sec.title}</h3>
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...props }: any) {
                        return (
                          <code
                            className="p-1 px-1.5 rounded bg-slate-950 text-cyan-300 font-mono text-xs border border-slate-800"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      pre({ children }: any) {
                        return (
                          <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 my-4">
                            {children}
                          </pre>
                        );
                      },
                    }}
                  >
                    {sec.markdown}
                  </ReactMarkdown>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
