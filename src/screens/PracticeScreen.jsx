import { Check, Lightbulb, X } from "lucide-react";
import { TOKENS } from "../theme.js";
import BackRow from "../components/BackRow.jsx";
import ProgressDots from "../components/ProgressDots.jsx";
import GraphDiagram from "../components/GraphDiagram.jsx";

export default function PracticeScreen({ steps, idx, input, setInput, error, hint, setHint, revealed, onCheck, onNext, onExit }) {
  const step = steps[idx];
  const isRight = revealed && input.trim() === step.answer;
  return (
    <div style={{ padding: "8px 20px 0" }}>
      <BackRow onBack={onExit} label="Выйти" />
      <ProgressDots total={steps.length} current={idx} />
      <div key={idx} className="quest-pop" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 16, padding: "22px 20px" }}>
        <span style={{ display: "inline-block", background: TOKENS.surfaceLight, color: TOKENS.gold, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, marginBottom: 14 }}>
          Задача {idx + 1} из {steps.length}
        </span>
        {step.graph && <GraphDiagram graph={step.graph} />}
        <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" }}>{step.prompt}</p>
        {!hint && !revealed && (
          <button className="quest-btn" onClick={() => setHint(true)} style={{ background: "transparent", color: TOKENS.gold, fontSize: 13, padding: 0, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Lightbulb size={14} /> Показать подсказку
          </button>
        )}
        {hint && !revealed && (
          <div style={{ fontSize: 13, color: TOKENS.textMuted, background: TOKENS.surfaceLight, padding: "10px 12px", borderRadius: 10, marginBottom: 14 }}>{step.hint}</div>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            value={input}
            disabled={revealed}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введи ответ"
            style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: `1px solid ${error ? TOKENS.coral : TOKENS.border}`, background: TOKENS.bg2, color: TOKENS.text, fontSize: 15 }}
          />
          {step.unit && <span style={{ color: TOKENS.textMuted, fontSize: 14 }}>{step.unit}</span>}
        </div>
        {error && <p style={{ color: TOKENS.coral, fontSize: 13, marginTop: 8 }}>{error}</p>}
        {revealed && (
          <div className="quest-pop" style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: isRight ? TOKENS.mintDark : TOKENS.coralDark, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            {isRight ? <Check size={16} color={TOKENS.mint} /> : <X size={16} color={TOKENS.coral} />}
            <span>{isRight ? "Верно! " : `Правильный ответ: ${step.answer}${step.unit ? " " + step.unit : ""}. `}{step.hint}</span>
          </div>
        )}
      </div>
      <button
        className="quest-btn"
        onClick={revealed ? onNext : onCheck}
        style={{ marginTop: 18, width: "100%", padding: "12px 16px", borderRadius: 12, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 15 }}
      >
        {revealed ? (idx + 1 >= steps.length ? "Готово" : "Следующая задача") : "Проверить"}
      </button>
    </div>
  );
}
