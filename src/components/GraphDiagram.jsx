import { TOKENS } from "../theme.js";

const NODE_R = 15;

// Рисует направленный граф (вершины-буквы, стрелки в одну сторону) — формат
// задания «сколько путей из А в К» на ОГЭ. graph = { nodes: [{id,x,y}], edges: [[from,to], ...] }.
// viewBox считается автоматически по границам узлов, чтобы графы разного
// размера никогда не обрезались (не нужно вручную подгонять width/height).
export default function GraphDiagram({ graph }) {
  const byId = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
  const pad = NODE_R + 6;
  const xs = graph.nodes.map((n) => n.x);
  const ys = graph.nodes.map((n) => n.y);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) - minX + pad;
  const h = Math.max(...ys) - minY + pad;

  return (
    <svg viewBox={`${minX} ${minY} ${w} ${h}`} style={{ width: "100%", maxWidth: 360, display: "block", margin: "0 auto 14px" }}>
      <defs>
        <marker id="graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={TOKENS.gold} />
        </marker>
      </defs>
      {graph.edges.map(([fromId, toId], i) => {
        const a = byId[fromId];
        const b = byId[toId];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const x1 = a.x + ux * NODE_R;
        const y1 = a.y + uy * NODE_R;
        const x2 = b.x - ux * (NODE_R + 6);
        const y2 = b.y - uy * (NODE_R + 6);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={TOKENS.border}
            strokeWidth={2}
            markerEnd="url(#graph-arrow)"
          />
        );
      })}
      {graph.nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={NODE_R} fill={TOKENS.surface} stroke={TOKENS.gold} strokeWidth={2} />
          <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fill={TOKENS.text} fontSize={13} fontWeight={700}>
            {n.id}
          </text>
        </g>
      ))}
    </svg>
  );
}
