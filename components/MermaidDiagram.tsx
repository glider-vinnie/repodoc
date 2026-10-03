"use client";

import React, { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function renderMermaid() {
      if (!chart || !chart.trim()) return;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
        });

        if (containerRef.current && isMounted) {
          containerRef.current.innerHTML = "";
          const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (isMounted && containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        }
      } catch (err) {
        console.log("[MermaidDiagram] Error rendering diagram:", err);
        if (isMounted) setRenderError(true);
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (renderError || !chart) {
    return (
      <div className="mt-4">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Mermaid Diagram Source
        </span>
        <pre className="p-3 rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800">
          {chart || "No diagram source provided."}
        </pre>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-x-auto flex justify-center">
      <div ref={containerRef} className="mermaid-container" />
    </div>
  );
}
