import { Check, X } from "lucide-react";
import { TOKENS } from "../theme.js";
import BackRow from "../components/BackRow.jsx";
import ProgressDots from "../components/ProgressDots.jsx";
import GraphDiagram from "../components/GraphDiagram.jsx";

export default function TypicalTasksScreen({ tasks, idx, input, setInput, error, checked, correct, onCheck, onNext, onExit }) {
  const total = tasks.length;
  const item = tasks[idx];
  if (!item) return null;
  return (
    <div style={{ padding: "8px 20px 0" }}>
      <BackRow onBack={onExit} label="Выйти" />
      <h2 className="quest-heading" style={{ fontSize: 20, margin: "12px 0 4px" }}>Типовые задания</h2>
      <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: "0 0 16px" }}>
        Задачи в стиле реального экзамена. Введи ответ — приложение сразу проверит.
      </p>
      <ProgressDots total={total} current={idx} />
      <div key={idx} className="quest-pop" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 16, padding: "22px 20px" }}>
        <span style={{ display: "inline-block", background: TOKENS.surfaceLight, color: TOKENS.gold, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, marginBottom: 14 }}>
          Задача {idx + 1} из {total}
        </span>
        {item.graph && <GraphDiagram graph={item.graph} />}
        <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" }}>{item.prompt}</p>
        <input
          type="text"
          value={input}
          disabled={checked}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введи ответ"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${error ? TOKENS.coral : TOKENS.border}`, background: TOKENS.bg2, color: TOKENS.text, fontSize: 15 }}
        />
        {error && <p style={{ color: TOKENS.coral, fontSize: 13, marginTop: 8 }}>{error}</p>}
        {checked && (
          <div className="quest-pop" style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: correct ? TOKENS.mintDark : TOKENS.coralDark, fontSize: 14, display: "flex", alignItems: "flex-start", gap: 8 }}>
            {correct ? <Check size={16} color={TOKENS.mint} style={{ flexShrink: 0, marginTop: 2 }} /> : <X size={16} color={TOKENS.coral} style={{ flexShrink: 0, marginTop: 2 }} />}
            <span>{correct ? "Верно! " : `Правильный ответ: ${item.answer}. `}{item.explain}</span>
          </div>
        )}
      </div>
      <button
        className="quest-btn"
        onClick={checked ? onNext : onCheck}
        style={{ marginTop: 18, width: "100%", padding: "12px 16px", borderRadius: 12, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 15 }}
      >
        {checked ? (idx + 1 >= total ? "Завершить" : "Следующая задача") : "Проверить"}
      </button>
    </div>
  );
}
