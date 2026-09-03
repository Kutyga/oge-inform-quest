import { ChevronLeft } from "lucide-react";
import { TOKENS } from "../theme.js";
import BackRow from "../components/BackRow.jsx";
import ProgressDots from "../components/ProgressDots.jsx";

export default function TheoryScreen({ cards, idx, setIdx, onDone, onExit }) {
  const card = cards[idx];
  const isLast = idx === cards.length - 1;
  return (
    <div style={{ padding: "8px 20px 0" }}>
      <BackRow onBack={onExit} label="Выйти из темы" />
      <ProgressDots total={cards.length} current={idx} />
      <div key={idx} className="quest-pop" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 16, padding: "24px 20px", minHeight: 220 }}>
        <span style={{ display: "inline-block", background: TOKENS.surfaceLight, color: TOKENS.gold, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, marginBottom: 14 }}>
          {card.tag}
        </span>
        <h3 className="quest-heading" style={{ fontSize: 19, margin: "0 0 10px" }}>{card.title}</h3>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: TOKENS.text, margin: 0 }}>{card.body}</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {idx > 0 && (
          <button className="quest-btn" onClick={() => setIdx((i) => i - 1)} style={{ flex: "0 0 auto", padding: "12px 16px", borderRadius: 12, background: TOKENS.surfaceLight, color: TOKENS.text, display: "flex", alignItems: "center" }}>
            <ChevronLeft size={18} />
          </button>
        )}
        <button
          className="quest-btn"
          onClick={() => (isLast ? onDone() : setIdx((i) => i + 1))}
          style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 15 }}
        >
          {isLast ? "Готово — к квизу" : "Дальше"}
        </button>
      </div>
    </div>
  );
}
