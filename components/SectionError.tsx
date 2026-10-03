import React from "react";
import { AlertTriangle } from "lucide-react";

interface SectionErrorProps {
  title?: string;
  error?: string;
}

export function SectionError({ title = "Section Analysis Error", error }: SectionErrorProps) {
  return (
    <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <h3 className="font-bold text-base text-amber-200">{title}</h3>
      </div>
      <p className="text-xs opacity-90 leading-relaxed pl-8">
        {error || "An isolated error occurred while processing this section. Other sections remain fully available."}
      </p>
    </div>
  );
}
