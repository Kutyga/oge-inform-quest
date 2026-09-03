import { Sparkles, Star, Trophy } from "lucide-react";
import { TOKENS } from "../theme.js";
import { ACHIEVEMENTS } from "../data/achievements.js";

export default function StageResultScreen({ result, onContinue }) {
  if (!result) return null;
  const isFinal = result.kind === "final";
  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div className="quest-pop" style={{ width: 72, height: 72, borderRadius: "50%", background: TOKENS.goldDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Trophy size={30} color={TOKENS.gold} />
      </div>
      <h3 className="quest-heading" style={{ fontSize: 20, margin: "0 0 6px" }}>
        {isFinal ? "Итоговая проверка пройдена!" : result.kind === "quiz" ? "Квиз пройден!" : "Практика пройдена!"}
      </h3>
      {(result.kind === "quiz" || isFinal) && (
        <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: "0 0 12px" }}>Результат: {result.score} из {result.total}</p>
      )}
      {isFinal && (
        <div style={{ display: "flex", justifyContent: "center", gap: 4, margin: "0 0 16px" }}>
          {[0, 1, 2].map((s) => (
            <Star key={s} size={26} fill={s < result.stars ? TOKENS.gold : "none"} color={TOKENS.gold} />
          ))}
        </div>
      )}
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

      <button className="quest-btn" onClick={onContinue} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 15 }}>
        Продолжить
      </button>
    </div>
  );
}
