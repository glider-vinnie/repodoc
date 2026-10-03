import React from "react";
import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "severity-high" | "severity-medium" | "severity-low" | "easy" | "medium" | "ok" | "warning" | "neutral" | "info";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "neutral", size = "sm", className }: BadgeProps) {
  const variantStyles = {
    "severity-high": "bg-rose-500/10 text-rose-400 border-rose-500/20",
    "severity-medium": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "severity-low": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ok: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    neutral: "bg-slate-800 text-slate-300 border-slate-700",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center font-bold uppercase tracking-wider rounded-md border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
