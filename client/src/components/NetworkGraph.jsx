import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

export default function NetworkGraph({ graphData, onNodeClick }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#2f6fed";

  const data = {
    nodes: graphData.nodes,
    links: graphData.edges.map((e) => ({ ...e })),
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <ForceGraph2D
        graphData={data}
        width={size.width}
        height={size.height}
        linkColor={(link) => (link.type === "own" ? "#c7c9ce" : accent)}
        linkWidth={(link) => (link.type === "own" ? 1.2 : 2)}
        linkLineDash={(link) => (link.type === "auto-mutual" ? [5, 4] : null)}
        nodeRelSize={7}
        onNodeClick={(node) => onNodeClick?.(node)}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const isSelf = node.id === "self";
          const radius = isSelf ? 12 : 9;

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = isSelf ? accent : node.matched ? "#ffffff" : "#dfe1e5";
          ctx.fill();
          if (!isSelf) {
            ctx.lineWidth = node.matched ? 2 : 0;
            ctx.strokeStyle = accent;
            ctx.stroke();
          }

          const fontSize = 11 / globalScale;
          ctx.font = `${node.matched || isSelf ? 600 : 500} ${fontSize}px -apple-system, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#1c1c1e";
          ctx.fillText(isSelf ? "You" : node.label, node.x, node.y + radius + 3);
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.id === "self" ? 12 : 9, 0, 2 * Math.PI);
          ctx.fill();
        }}
      />
    </div>
  );
}
