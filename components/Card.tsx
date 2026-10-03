import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({ children, className, hoverEffect = false, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl transition-all shadow-xl",
        hoverEffect && "hover:border-slate-700/80 hover:bg-slate-900/80 hover:shadow-indigo-950/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
