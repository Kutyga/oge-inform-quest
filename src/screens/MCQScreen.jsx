import { Check, Lightbulb, X } from "lucide-react";
import { TOKENS } from "../theme.js";
import BackRow from "../components/BackRow.jsx";
import HeartsRow from "../components/HeartsRow.jsx";
import ProgressDots from "../components/ProgressDots.jsx";

export default function MCQScreen({ mode, questions, idx, hearts, selected, feedback, onAnswer, onNext, onExit }) {
  const q = questions[idx];
  const isFinal = mode === "final";
  return (
    <div style={{ padding: "8px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackRow onBack={onExit} label="Выйти" />
        <HeartsRow hearts={hearts} />
      </div>
      <ProgressDots total={questions.length} current={idx} />
      <div key={idx} className="quest-pop">
        {isFinal && (
          <span style={{ display: "inline-block", background: TOKENS.coralDark, color: "#FFD9D3", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, marginBottom: 12 }}>
            Без подсказок — как на экзамене
          </span>
        )}
        <h3 className="quest-heading" style={{ fontSize: 18, lineHeight: 1.4, margin: "4px 0 18px" }}>{q.q}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            let border = TOKENS.border;
            let bg = TOKENS.surface;
            let icon = null;
            if (selected !== null) {
              if (i === q.correct) {
                border = TOKENS.mint;
                bg = TOKENS.mintDark;
                icon = <Check size={16} color={TOKENS.mint} />;
              } else if (i === selected) {
                border = TOKENS.coral;
                bg = TOKENS.coralDark;
                icon = <X size={16} color={TOKENS.coral} />;
              }
            }
            return (
              <button
                key={i}
                className={`quest-btn quest-option ${selected === i && feedback === "wrong" ? "quest-shake" : ""}`}
                disabled={selected !== null}
                onClick={() => onAnswer(i)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", padding: "14px 16px", borderRadius: 12, border: `1px solid ${border}`, background: bg, color: TOKENS.text, fontSize: 15 }}
              >
                <span>{opt}</span>
                {icon}
              </button>
            );
          })}
        </div>
        {feedback && (
          <div className="quest-pop" style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: TOKENS.surfaceLight, fontSize: 13, color: TOKENS.textMuted, display: "flex", gap: 8 }}>
            <Lightbulb size={16} color={TOKENS.gold} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{q.explain}</span>
          </div>
        )}
      </div>
      {feedback && (
        <button
          className="quest-btn"
          onClick={onNext}
          style={{ marginTop: 18, width: "100%", padding: "12px 16px", borderRadius: 12, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 15 }}
        >
          {idx + 1 >= questions.length ? (isFinal ? "Узнать результат" : "Завершить квиз") : "Следующий вопрос"}
        </button>
      )}
    </div>
  );
}
