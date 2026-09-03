import { Check, X } from "lucide-react";
import { TOKENS } from "../theme.js";
import BackRow from "../components/BackRow.jsx";

export default function CodeLabScreen({
  levels,
  levelIdx,
  onPickLevel,
  source,
  setSource,
  exampleOutput,
  exampleError,
  testResults,
  showSolution,
  setShowSolution,
  onRunExample,
  onCheck,
  solvedLevels,
  onExit,
}) {
  const level = levels[levelIdx];
  const isSolved = solvedLevels.includes(level.id);
  const allPass = testResults ? testResults.every((r) => r.pass) : false;

  const codeStyle = {
    width: "100%",
    minHeight: 180,
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${TOKENS.border}`,
    background: TOKENS.bg2,
    color: TOKENS.text,
    fontSize: 13,
    fontFamily: "monospace",
    lineHeight: 1.5,
    resize: "vertical",
  };

  return (
    <div style={{ padding: "8px 20px 0" }}>
      <BackRow onBack={onExit} label="Выйти" />
      <h2 className="quest-heading" style={{ fontSize: 20, margin: "12px 0 4px" }}>Написать код</h2>
      <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: "0 0 14px" }}>
        Пиши настоящий Python-подобный код — он реально выполняется прямо здесь, ввод берётся из примера.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {levels.map((lvl, i) => (
          <button
            key={lvl.id}
            className="quest-btn"
            onClick={() => onPickLevel(i)}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              background: i === levelIdx ? TOKENS.gold : TOKENS.surfaceLight,
              color: i === levelIdx ? "#3D2A02" : TOKENS.textMuted,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {solvedLevels.includes(lvl.id) && <Check size={12} />}
            Уровень {lvl.id}
          </button>
        ))}
      </div>

      <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
        <div className="quest-heading" style={{ fontSize: 15, marginBottom: 6 }}>{level.title}</div>
        <p style={{ fontSize: 13, color: TOKENS.text, lineHeight: 1.5, margin: "0 0 10px" }}>{level.description}</p>
        <div style={{ fontSize: 12, color: TOKENS.textMuted }}>
          <strong style={{ color: TOKENS.gold }}>Пример:</strong> вход: {level.example.input.join(", ")} → выход: {level.example.output.join(", ")}
        </div>
      </div>

      <textarea
        value={source}
        onChange={(e) => setSource(e.target.value)}
        spellCheck={false}
        style={codeStyle}
      />

      <div style={{ display: "flex", gap: 8, margin: "10px 0" }}>
        <button className="quest-btn" onClick={onRunExample} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: TOKENS.surfaceLight, color: TOKENS.text, fontSize: 13, fontWeight: 600 }}>
          Запустить на примере
        </button>
        <button className="quest-btn" onClick={onCheck} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: TOKENS.mint, color: "#0B2F1B", fontSize: 13, fontWeight: 700 }}>
          Проверить решение
        </button>
      </div>

      {exampleError && (
        <div className="quest-pop" style={{ padding: "10px 12px", borderRadius: 10, background: TOKENS.coralDark, fontSize: 13, marginBottom: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <X size={14} color={TOKENS.coral} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>Ошибка: {exampleError}</span>
        </div>
      )}
      {exampleOutput && !exampleError && (
        <div style={{ padding: "10px 12px", borderRadius: 10, background: TOKENS.bg2, border: `1px solid ${TOKENS.border}`, fontSize: 13, marginBottom: 12, fontFamily: "monospace" }}>
          <span style={{ color: TOKENS.textMuted }}>Вывод программы: </span>
          {exampleOutput.join(" / ")}
        </div>
      )}

      {testResults && (
        <div className="quest-pop" style={{ marginBottom: 14 }}>
          <div style={{ padding: "10px 14px", borderRadius: 10, background: allPass ? TOKENS.mintDark : TOKENS.coralDark, fontSize: 14, fontWeight: 700, textAlign: "center", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {allPass ? <Check size={16} color={TOKENS.mint} /> : <X size={16} color={TOKENS.coral} />}
            {allPass ? "Все тесты пройдены!" : "Есть непройденные тесты"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {testResults.map((r) => (
              <div key={r.i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, background: TOKENS.surface, border: `1px solid ${r.pass ? TOKENS.mint : TOKENS.coral}`, fontSize: 12 }}>
                {r.pass ? <Check size={13} color={TOKENS.mint} /> : <X size={13} color={TOKENS.coral} />}
                <span style={{ color: TOKENS.textMuted }}>
                  Тест {r.i + 1}{r.isExample ? " (пример)" : ""}: {r.error ? `ошибка — ${r.error}` : r.pass ? "верно" : `получено ${r.got ? r.got.join("/") : "—"}, ожидалось ${r.expected.join("/")}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSolved && (
        <div style={{ textAlign: "center", fontSize: 12, color: TOKENS.mint, marginBottom: 12 }}>
          Этот уровень уже решён — можешь потренироваться ещё раз.
        </div>
      )}

      {!showSolution ? (
        <button className="quest-btn" onClick={() => setShowSolution(true)} style={{ width: "100%", background: "transparent", color: TOKENS.textMuted, fontSize: 12, padding: "8px 0", marginBottom: 24 }}>
          Показать пример решения
        </button>
      ) : (
        <pre style={{ fontSize: 12, color: TOKENS.textMuted, background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 24, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
          {level.solution}
        </pre>
      )}
    </div>
  );
}
