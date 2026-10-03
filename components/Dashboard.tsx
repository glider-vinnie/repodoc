"use client";

import React, { useState } from "react";
import { AnalysisResult } from "@/lib/types";
import { OverviewSection } from "./sections/OverviewSection";
import { ArchitectureSection } from "./sections/ArchitectureSection";
import { DocsSection } from "./sections/DocsSection";
import { GoodFirstIssuesSection } from "./sections/GoodFirstIssuesSection";
import { BugsSection } from "./sections/BugsSection";
import { ReadmeScoreSection } from "./sections/ReadmeScoreSection";
import { DependenciesSection } from "./sections/DependenciesSection";
import { ContributorGuideSection } from "./sections/ContributorGuideSection";

interface DashboardProps {
  result: AnalysisResult;
}

type TabKey =
  | "overview"
  | "architecture"
  | "docs"
  | "goodFirstIssues"
  | "bugs"
  | "readme"
  | "dependencies"
  | "contributorGuide";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "architecture", label: "Architecture", icon: "🏗️" },
  { key: "docs", label: "Generated Docs", icon: "📚" },
  { key: "goodFirstIssues", label: "Good First Issues", icon: "🎯" },
  { key: "bugs", label: "Bugs & Scans", icon: "🐛" },
  { key: "readme", label: "README Score", icon: "📝" },
  { key: "dependencies", label: "Dependencies", icon: "📦" },
  { key: "contributorGuide", label: "Contributor Guide", icon: "🚀" },
];

export function Dashboard({ result }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const { repo, errors } = result;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-16">
      {/* Global Error Banner if present */}
      {errors.global && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{errors.global}</span>
          </div>
        </div>
      )}

      {/* Repo Header Bar */}
      <div className="p-6 mb-8 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-indigo-950/40 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {repo.owner} / <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">{repo.name}</span>
            </h2>
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              Open on GitHub ↗
            </a>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl line-clamp-2">
            {repo.description || "No repository description provided."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
            {repo.defaultBranch}
          </span>
          <span className="text-slate-600">•</span>
          <span>Updated {new Date(repo.lastPush).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 mb-8 no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const hasSectionError = !!errors[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                  : "bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800/50 border border-slate-800/60"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {hasSectionError && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Warning in section" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div className="transition-all duration-300">
        {activeTab === "overview" && (
          <OverviewSection data={result.overview} repo={repo} error={errors.overview} />
        )}
        {activeTab === "architecture" && (
          <ArchitectureSection data={result.architecture} error={errors.architecture} />
        )}
        {activeTab === "docs" && (
          <DocsSection data={result.docs} error={errors.docs} />
        )}
        {activeTab === "goodFirstIssues" && (
          <GoodFirstIssuesSection data={result.goodFirstIssues} error={errors.goodFirstIssues} />
        )}
        {activeTab === "bugs" && (
          <BugsSection data={result.bugs} error={errors.bugs} />
        )}
        {activeTab === "readme" && (
          <ReadmeScoreSection data={result.readme} error={errors.readme} />
        )}
        {activeTab === "dependencies" && (
          <DependenciesSection data={result.dependencies} error={errors.dependencies} />
        )}
        {activeTab === "contributorGuide" && (
          <ContributorGuideSection data={result.contributorGuide} error={errors.contributorGuide} />
        )}
      </div>
    </div>
  );
}
