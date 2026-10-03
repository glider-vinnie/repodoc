"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { Search, ArrowRight, BookOpen, Bug, Target, ShieldCheck, Sparkles } from "lucide-react";

const DEMO_REPOS = [
  { name: "expressjs/express", label: "Express.js" },
  { name: "pallets/flask", label: "Flask (Python)" },
  { name: "facebook/react", label: "React" },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "Generated Documentation",
    description: "Instant clear breakdown of what the repo does, how code flows, and module responsibilities.",
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Bug,
    title: "Bug & Quality Scanning",
    description: "Scan open issues and static code patterns for potential bug risks and fixes.",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: Target,
    title: "Good First Issues",
    description: "Ranked entry-level tasks with step-by-step guidance for new contributors.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: ShieldCheck,
    title: "README & Dependency Audit",
    description: "Score README completeness and audit package version health in seconds.",
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
];

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateAndNavigate = (inputUrl: string) => {
    setError(null);
    let trimmed = inputUrl.trim();
    if (!trimmed) {
      setError("Please enter a repository URL or owner/repo format.");
      return;
    }

    // Clean leading https://github.com/
    if (trimmed.startsWith("https://github.com/")) {
      trimmed = trimmed.replace("https://github.com/", "");
    } else if (trimmed.startsWith("http://github.com/")) {
      trimmed = trimmed.replace("http://github.com/", "");
    }
    if (trimmed.endsWith(".git")) {
      trimmed = trimmed.slice(0, -4);
    }

    const parts = trimmed.split("/").filter(Boolean);
    if (parts.length < 2) {
      setError("Invalid format. Use 'owner/repo' or 'github.com/owner/repo'.");
      return;
    }

    const repoQuery = `${parts[0]}/${parts[1]}`;
    router.push(`/analyze?repo=${encodeURIComponent(repoQuery)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndNavigate(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-6xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Contributor Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Understand any open-source repo and{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
              make your first contribution faster.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            Get instant architecture visualizers, bug scans, good first issue recommendations, and setup guides tailored for developers.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="w-full max-w-2xl mx-auto mb-16">
          <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl shadow-indigo-950/40">
            <div className="relative flex-1">
              <label htmlFor="repo-url-input" className="sr-only">GitHub Repository URL or owner/repo</label>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="repo-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste GitHub URL or repo name (e.g. expressjs/express)"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
            >
              <span>Analyze</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {error && (
            <p className="text-xs text-rose-400 mt-2 text-center">{error}</p>
          )}

          {/* Clickable Demo Repos */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Try demo repos:</span>
            {DEMO_REPOS.map((sample) => (
              <button
                key={sample.name}
                onClick={() => validateAndNavigate(sample.name)}
                className="text-xs px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} hoverEffect className="flex flex-col justify-between">
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>RepoLens • Built for Hackathons & Developer Onboarding</p>
      </footer>
    </div>
  );
}
