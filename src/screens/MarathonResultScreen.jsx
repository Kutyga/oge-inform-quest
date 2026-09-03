import { Flame, RotateCcw, Sparkles } from "lucide-react";
import { TOKENS } from "../theme.js";

export default function MarathonResultScreen({ result, onContinue, onRetry }) {
  if (!result) return null;
  const avgRounded = Math.round(result.avgGrade * 10) / 10;
  return (
    <div style={{ padding: "36px 20px", textAlign: "center" }}>
      <div className="quest-pop" style={{ width: 76, height: 76, borderRadius: "50%", background: TOKENS.surfaceLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", border: `2px solid ${TOKENS.coral}` }}>
        <Flame size={30} color={TOKENS.coral} />
      </div>
      <h3 className="quest-heading" style={{ fontSize: 20, margin: "0 0 6px" }}>Марафон пройден!</h3>
      <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: "0 0 4px" }}>
        Итог: {result.totalScore} из {result.totalMax} по трём экзаменам
      </p>
      <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: "0 0 18px" }}>
        Средняя оценка: {avgRounded}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, textAlign: "left" }}>
        {result.rounds.map((r) => (
          <div key={r.round} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: "10px 14px" }}>
            <span style={{ fontSize: 13, color: TOKENS.textMuted }}>Экзамен {r.round}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {r.score}/{r.total} · оценка {r.grade}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 24 }}>
        <Sparkles size={16} color={TOKENS.gold} />
        <span style={{ color: TOKENS.gold, fontWeight: 700, fontSize: 15 }}>+{result.xp} XP бонус за марафон</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="quest-btn" onClick={onRetry} style={{ padding: "13px 16px", borderRadius: 12, background: TOKENS.coral, color: "#3D0F0A", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <RotateCcw size={16} /> Пройти марафон снова
        </button>
        <button className="quest-btn" onClick={onContinue} style={{ padding: "13px 16px", borderRadius: 12, background: "transparent", color: TOKENS.textMuted, fontSize: 14 }}>
          На карту тем
        </button>
      </div>
    </div>
  );
}
