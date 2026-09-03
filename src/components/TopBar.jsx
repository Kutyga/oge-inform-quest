import { Sparkles, User, Volume2, VolumeX } from "lucide-react";
import { TOKENS } from "../theme.js";

export default function TopBar({ xp, soundOn, onToggleSound, onProfile }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 16px" }}>
      <div className="quest-heading" style={{ fontSize: 18, fontWeight: 600 }}>
        Инфо-квест ОГЭ
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={16} color={TOKENS.gold} />
          <span style={{ fontSize: 14, fontWeight: 700, color: TOKENS.gold }}>{xp} XP</span>
        </div>
        <button
          className="quest-btn"
          onClick={onToggleSound}
          aria-label={soundOn ? "Выключить звук" : "Включить звук"}
          style={{ background: "transparent", padding: 4, display: "flex" }}
        >
          {soundOn ? <Volume2 size={18} color={TOKENS.textMuted} /> : <VolumeX size={18} color={TOKENS.textMuted} />}
        </button>
        <button
          className="quest-btn"
          onClick={onProfile}
          aria-label="Личный кабинет"
          style={{
            background: TOKENS.surfaceLight,
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={16} color={TOKENS.gold} />
        </button>
      </div>
    </div>
  );
}
