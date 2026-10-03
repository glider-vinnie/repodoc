"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnalysisResult } from "@/lib/types";
import { OverviewSection } from "./sections/OverviewSection";
import { ArchitectureSection } from "./sections/ArchitectureSection";
import { DocsSection } from "./sections/DocsSection";
import { IssuesSection } from "./sections/IssuesSection";
import { BugsSection } from "./sections/BugsSection";
import { DependenciesSection } from "./sections/DependenciesSection";
import { ReadmeSection } from "./sections/ReadmeSection";
import { GuideSection } from "./sections/GuideSection";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import {
  Star,
  GitFork,
  AlertCircle,
  Code2,
  Scale,
  Clock,
  ArrowLeft,
  ExternalLink,
  LayoutDashboard,
  Workflow,
  BookOpen,
  Target,
  Bug,
  Package,
  FileText,
  Rocket,
} from "lucide-react";

interface DashboardProps {
  result: AnalysisResult;
}

type TabKey =
  | "overview"
  | "architecture"
  | "docs"
  | "goodFirstIssues"
  | "bugs"
  | "dependencies"
  | "readme"
  | "contributorGuide";

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} mo ago`;
  } catch {
    return "recently";
  }
}

export function Dashboard({ result }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const { repo, errors } = result;

  const tabs: { key: TabKey; label: string; icon: any; count?: number | string | null }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "architecture", label: "Architecture", icon: Workflow },
    { key: "docs", label: "Docs", icon: BookOpen, count: result.docs?.length || null },
    { key: "goodFirstIssues", label: "Good First Issues", icon: Target, count: result.goodFirstIssues?.length || null },
    { key: "bugs", label: "Bugs", icon: Bug, count: result.bugs?.length || null },
    { key: "dependencies", label: "Dependencies", icon: Package, count: result.dependencies?.length || null },
    { key: "readme", label: "README", icon: FileText, count: result.readme?.score ? `${result.readme.score}%` : null },
    { key: "contributorGuide", label: "Contributor Guide", icon: Rocket },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-16 space-y-8">
      {/* Header Card */}
      <Card hoverEffect className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl md:text-3xl font-extrabold text-white hover:text-indigo-400 transition-colors flex items-center gap-2 group"
              >
                <span>{repo.owner} / {repo.name}</span>
                <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </a>
            </div>

            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              {repo.description || "No repository description provided."}
            </p>

            {/* Stat Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{repo.stars.toLocaleString()} stars</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-cyan-400">
                <GitFork className="w-3.5 h-3.5" />
                <span>{repo.forks.toLocaleString()} forks</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-indigo-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{repo.openIssues.toLocaleString()} open issues</span>
              </div>
              {repo.language && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-violet-400">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{repo.language}</span>
                </div>
              )}
              {repo.license && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300">
                  <Scale className="w-3.5 h-3.5" />
                  <span>{repo.license}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Pushed {formatRelativeTime(repo.lastPush)}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Analyze Another</span>
            </Link>
          </div>
        </div>
      </Card>

      {/* Main Grid: Left Sticky Sidebar + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sticky Sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-1 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
          <div className="flex lg:flex-col overflow-x-auto gap-1 no-scrollbar p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const hasError = !!errors[tab.key];

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium text-xs whitespace-nowrap transition-all w-full text-left ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tab.count !== null && tab.count !== undefined && (
                      <Badge variant={isActive ? "info" : "neutral"}>
                        {tab.count}
                      </Badge>
                    )}
                    {hasError && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Warning in section" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
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
            <IssuesSection data={result.goodFirstIssues} error={errors.goodFirstIssues} />
          )}
          {activeTab === "bugs" && (
            <BugsSection data={result.bugs} repo={repo} error={errors.bugs} />
          )}
          {activeTab === "dependencies" && (
            <DependenciesSection data={result.dependencies} error={errors.dependencies} />
          )}
          {activeTab === "readme" && (
            <ReadmeSection data={result.readme} error={errors.readme} />
          )}
          {activeTab === "contributorGuide" && (
            <GuideSection data={result.contributorGuide} error={errors.contributorGuide} />
          )}
        </div>
      </div>
    </div>
  );
}
