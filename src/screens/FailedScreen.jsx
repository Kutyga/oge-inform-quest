import { Heart, RotateCcw } from "lucide-react";
import { TOKENS } from "../theme.js";

export default function FailedScreen({ label, onRetry, onExit }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div className="quest-pop" style={{ width: 72, height: 72, borderRadius: "50%", background: TOKENS.coralDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Heart size={30} color={TOKENS.coral} />
      </div>
      <h3 className="quest-heading" style={{ fontSize: 19, margin: "0 0 8px" }}>{label}</h3>
      <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: "0 0 24px" }}>Ничего страшного — вернись к теории и попробуй ещё раз, жизни обновятся.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="quest-btn" onClick={onRetry} style={{ padding: "13px 16px", borderRadius: 12, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <RotateCcw size={16} /> Попробовать снова
        </button>
        <button className="quest-btn" onClick={onExit} style={{ padding: "13px 16px", borderRadius: 12, background: "transparent", color: TOKENS.textMuted, fontSize: 14 }}>
          Вернуться к теме
        </button>
      </div>
    </div>
  );
}
