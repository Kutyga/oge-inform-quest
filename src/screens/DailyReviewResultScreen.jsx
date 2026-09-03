import { Flame, RotateCcw, Sparkles } from "lucide-react";
import { TOKENS } from "../theme.js";
import { ACHIEVEMENTS } from "../data/achievements.js";

export default function DailyReviewResultScreen({ result, streakDays, onContinue }) {
  if (!result) return null;
  return (
    <div style={{ padding: "36px 20px", textAlign: "center" }}>
      <div className="quest-pop" style={{ width: 72, height: 72, borderRadius: "50%", background: TOKENS.mintDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <RotateCcw size={30} color={TOKENS.mint} />
      </div>
      <h3 className="quest-heading" style={{ fontSize: 20, margin: "0 0 6px" }}>Знания освежены!</h3>
      <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: "0 0 4px" }}>
        Результат: {result.score} из {result.total}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "8px 0 4px" }}>
        <Flame size={16} color={TOKENS.mint} />
        <span style={{ color: TOKENS.mint, fontSize: 14, fontWeight: 600 }}>Серия: {streakDays} {streakDays === 1 ? "день" : "дня"} подряд</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 20 }}>
        <Sparkles size={16} color={TOKENS.gold} />
        <span style={{ color: TOKENS.gold, fontWeight: 700, fontSize: 15 }}>+{result.xp} XP</span>
      </div>

      {result.newly && result.newly.length > 0 && (
        <div className="quest-pop" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.gold}`, borderRadius: 14, padding: "14px 16px", marginBottom: 20, textAlign: "left" }}>
          <div className="quest-heading" style={{ fontSize: 14, color: TOKENS.gold, marginBottom: 10 }}>Новое достижение!</div>
          {result.newly.map((id) => {
            const a = ACHIEVEMENTS.find((x) => x.id === id);
            if (!a) return null;
            const Icon = a.icon;
            return (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <Icon size={18} color={TOKENS.gold} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: TOKENS.textMuted }}>{a.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="quest-btn" onClick={onContinue} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: TOKENS.mint, color: "#0B2F1B", fontWeight: 700, fontSize: 15 }}>
        На карту тем
      </button>
    </div>
  );
}
