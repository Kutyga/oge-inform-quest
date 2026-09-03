import { useState, useEffect } from "react";
import { TOKENS } from "../theme.js";

export default function Confetti({ trigger }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (trigger === 0) return;
    const colors = [TOKENS.gold, TOKENS.mint, TOKENS.coral, "#8B7FE8"];
    const arr = Array.from({ length: 22 }).map((_, i) => ({
      id: `${trigger}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.15,
      color: colors[i % colors.length],
      size: 5 + Math.random() * 4,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 900);
    return () => clearTimeout(t);
  }, [trigger]);

  if (pieces.length === 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 20 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: 2,
            animation: `confettiFall 0.9s ease-in forwards`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
