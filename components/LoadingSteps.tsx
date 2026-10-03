"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

const STEPS = [
  "Fetching repository",
  "Reading code structure",
  "Generating documentation",
  "Scanning for bugs",
  "Finding good first issues",
  "Checking dependencies",
  "Scoring README",
];

interface LoadingStepsProps {
  onComplete?: () => void;
}

export function LoadingSteps({ onComplete }: LoadingStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Advance steps on a timer every ~6 seconds as specified
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-white">Analyzing Repository</h3>
        <p className="text-xs text-slate-400 mt-1">Generating deep architecture & contributor insights...</p>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? "bg-indigo-500/10 border border-indigo-500/30 text-white"
                  : isDone
                  ? "text-slate-300"
                  : "text-slate-600 opacity-60"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-700 shrink-0" />
              )}
              <span className="text-xs font-medium">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
