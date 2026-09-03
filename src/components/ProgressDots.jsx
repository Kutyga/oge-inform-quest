import { TOKENS } from "../theme.js";

export default function ProgressDots({ total, current }) {
  return (
    <div style={{ display: "flex", gap: 6, margin: "12px 0 20px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= current ? TOKENS.gold : TOKENS.surfaceLight }} />
      ))}
    </div>
  );
}
