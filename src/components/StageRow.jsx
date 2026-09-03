import { Check, ChevronRight } from "lucide-react";
import { TOKENS } from "../theme.js";

export default function StageRow({ icon, label, sub, done, onClick }) {
  const Icon = icon;
  return (
    <button
      className="quest-btn"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        background: TOKENS.surface,
        border: `1px solid ${done ? TOKENS.mint : TOKENS.border}`,
        borderRadius: 14,
        padding: "14px 16px",
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: done ? TOKENS.mintDark : TOKENS.surfaceLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {done ? <Check size={18} color={TOKENS.mint} /> : <Icon size={18} color={TOKENS.gold} />}
      </div>
      <div style={{ flex: 1 }}>
        <div className="quest-heading" style={{ fontWeight: 600, fontSize: 15 }}>{label}</div>
        <div style={{ fontSize: 12, color: TOKENS.textMuted, marginTop: 2 }}>{sub}</div>
      </div>
      <ChevronRight size={18} color={TOKENS.textMuted} />
    </button>
  );
}
