import { Check, Clock, SkipForward, X } from "lucide-react";
import { TOKENS } from "../theme.js";
import { TOPIC_META } from "../data/topics.js";
import BackRow from "../components/BackRow.jsx";
import ProgressDots from "../components/ProgressDots.jsx";
import GraphDiagram from "../components/GraphDiagram.jsx";

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function ExamScreen({ questions, idx, secondsLeft, input, setInput, error, checked, correct, onCheck, onNext, onSkip, onExit }) {
  const total = questions.length;
  const item = questions[idx];
  if (!item) return null;
  const meta = TOPIC_META[item.topicId];
  const low = secondsLeft <= 60;
  return (
    <div style={{ padding: "8px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackRow onBack={onExit} label="Прервать" />
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: low ? TOKENS.coral : TOKENS.text }}>
          <Clock size={16} />
          <span className="quest-heading" style={{ fontSize: 15, fontWeight: 600 }}>{formatTime(secondsLeft)}</span>
        </div>
      </div>
      <ProgressDots total={total} current={idx} />
      <div key={idx} className="quest-pop" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 16, padding: "22px 20px" }}>
        <span style={{ display: "inline-block", background: TOKENS.surfaceLight, color: TOKENS.gold, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, marginBottom: 14 }}>
          {item.topicId}. {meta.title}
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
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        {!checked && (
          <button
            className="quest-btn"
            onClick={onSkip}
            style={{ flex: "0 0 auto", padding: "12px 16px", borderRadius: 12, background: TOKENS.surfaceLight, color: TOKENS.textMuted, display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}
          >
            <SkipForward size={16} /> Пропустить
          </button>
        )}
        <button
          className="quest-btn"
          onClick={checked ? onNext : onCheck}
          style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 15 }}
        >
          {checked ? (idx + 1 >= total ? "Завершить экзамен" : "Следующее задание") : "Ответить"}
        </button>
      </div>
    </div>
  );
}
