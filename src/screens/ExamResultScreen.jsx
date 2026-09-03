import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import { TOKENS } from "../theme.js";
import { ACHIEVEMENTS } from "../data/achievements.js";

export default function ExamResultScreen({ result, onContinue, onRetry }) {
  if (!result) return null;
  const gradeColor = result.grade >= 4 ? TOKENS.mint : result.grade === 3 ? TOKENS.gold : TOKENS.coral;
  return (
    <div style={{ padding: "36px 20px", textAlign: "center" }}>
      <div className="quest-pop" style={{ width: 76, height: 76, borderRadius: "50%", background: TOKENS.surfaceLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", border: `2px solid ${gradeColor}` }}>
        <span className="quest-heading" style={{ fontSize: 28, fontWeight: 700, color: gradeColor }}>{result.grade}</span>
      </div>
      <h3 className="quest-heading" style={{ fontSize: 20, margin: "0 0 6px" }}>Экзамен завершён</h3>
      <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: "0 0 4px" }}>
        Результат: {result.score} из {result.total} ({result.percent}%)
      </p>
      <p style={{ color: TOKENS.textMuted, fontSize: 12, margin: "0 0 20px" }}>
        Оценка рассчитана пропорционально официальной шкале ОГЭ по информатике (5: 17–19, 4: 11–16, 3: 5–10 из 19 первичных баллов за всю работу). В нашем экзамене 15 заданий — по одному на каждую тему кодификатора, с условно равным весом (в реальном экзамене задания 13–15 «стоят» больше баллов), поэтому итоговая оценка ориентировочная.
      </p>

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

      <div style={{ textAlign: "left", marginBottom: 24 }}>
        <div className="quest-heading" style={{ fontSize: 14, marginBottom: 10 }}>Разбор по заданиям</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {result.answers.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: TOKENS.surface, border: `1px solid ${a.correct ? TOKENS.mint : TOKENS.coral}` }}>
              {a.correct ? <Check size={14} color={TOKENS.mint} /> : <X size={14} color={TOKENS.coral} />}
              <span style={{ fontSize: 12, color: TOKENS.textMuted }}>Тема {a.topicId}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="quest-btn" onClick={onRetry} style={{ padding: "13px 16px", borderRadius: 12, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <RotateCcw size={16} /> Пройти ещё раз
        </button>
        <button className="quest-btn" onClick={onContinue} style={{ padding: "13px 16px", borderRadius: 12, background: "transparent", color: TOKENS.textMuted, fontSize: 14 }}>
          На карту тем
        </button>
      </div>
    </div>
  );
}
