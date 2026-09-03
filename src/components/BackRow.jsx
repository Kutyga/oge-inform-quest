import { ArrowLeft } from "lucide-react";
import { TOKENS } from "../theme.js";

export default function BackRow({ onBack, label }) {
  return (
    <button
      className="quest-btn"
      onClick={onBack}
      style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", color: TOKENS.textMuted, fontSize: 13, padding: "6px 0" }}
    >
      <ArrowLeft size={15} />
      {label}
    </button>
  );
}
