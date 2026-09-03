import { Check, X } from "lucide-react";
import { TOKENS } from "../theme.js";
import { hasWall } from "../utils/robotInterpreter.js";
import BackRow from "../components/BackRow.jsx";

const WALL_THICK = "3px solid " + TOKENS.gold;

function RobotGrid({ level, painted, robotPos, crashed }) {
  const cells = [];
  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      const key = `${r},${c}`;
      const isTarget = level.target.includes(key);
      const isPainted = painted ? painted.has(key) : false;
      const isRobot = robotPos && robotPos.row === r && robotPos.col === c;
      let bg = TOKENS.bg2;
      let border = TOKENS.border;
      if (painted) {
        if (isPainted && isTarget) {
          bg = TOKENS.mintDark;
          border = TOKENS.mint;
        } else if (isPainted && !isTarget) {
          bg = TOKENS.coralDark;
          border = TOKENS.coral;
        } else if (!isPainted && isTarget) {
          bg = TOKENS.surface;
          border = TOKENS.gold;
        }
      } else if (isTarget) {
        bg = TOKENS.surface;
        border = TOKENS.gold;
      }
      cells.push(
        <div
          key={key}
          style={{
            width: 42,
            height: 42,
            background: bg,
            borderLeft: hasWall(level, r, c, "left") ? WALL_THICK : `2px solid ${border}`,
            borderTop: hasWall(level, r, c, "up") ? WALL_THICK : `2px solid ${border}`,
            borderRight: hasWall(level, r, c, "right") ? WALL_THICK : `2px solid ${border}`,
            borderBottom: hasWall(level, r, c, "down") ? WALL_THICK : `2px solid ${border}`,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: TOKENS.gold,
            fontWeight: 700,
          }}
        >
          {isRobot ? (crashed ? "✕" : "●") : ""}
        </div>
      );
    }
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${level.cols}, 42px)`, gap: 4, justifyContent: "center", margin: "16px 0" }}>
      {cells}
    </div>
  );
}

export default function RobotSimScreen({
  levels,
  levelIdx,
  onPickLevel,
  source,
  setSource,
  runResult,
  error,
  showSolution,
  setShowSolution,
  onRun,
  solvedLevels,
  onExit,
}) {
  const level = levels[levelIdx];
  const isSolved = solvedLevels.includes(level.id);

  const codeStyle = {
    width: "100%",
    minHeight: 140,
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
      <h2 className="quest-heading" style={{ fontSize: 20, margin: "12px 0 4px" }}>Симулятор Робота</h2>
      <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: "0 0 14px" }}>
        Напиши программу, чтобы Робот закрасил ровно нужные клетки (обведены золотым). Команды: вверх, вниз,
        влево, вправо, закрасить. Условия: сверху/снизу/слева/справа свободно/стена. Управление: если...то...(иначе...)все,
        нц N раз...кц, нц пока...кц.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {levels.map((lvl, i) => (
          <button
            key={lvl.id}
            className="quest-btn"
            onClick={() => onPickLevel(i)}
            style={{
              flex: 1,
              padding: "9px 8px",
              borderRadius: 10,
              background: i === levelIdx ? TOKENS.gold : TOKENS.surfaceLight,
              color: i === levelIdx ? "#3D2A02" : TOKENS.textMuted,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            {solvedLevels.includes(lvl.id) && <Check size={12} />}
            {lvl.title}
          </button>
        ))}
      </div>

      <RobotGrid
        level={level}
        painted={runResult ? runResult.painted : null}
        robotPos={runResult ? runResult.finalPos : level.start}
        crashed={runResult ? runResult.crashed : false}
      />

      {error && (
        <div className="quest-pop" style={{ padding: "10px 12px", borderRadius: 10, background: TOKENS.coralDark, fontSize: 13, marginBottom: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <X size={14} color={TOKENS.coral} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>Ошибка: {error}</span>
        </div>
      )}
      {runResult && !error && (
        <div
          className="quest-pop"
          style={{
            textAlign: "center",
            padding: "10px 14px",
            borderRadius: 12,
            marginBottom: 14,
            background: runResult.matches ? TOKENS.mintDark : TOKENS.coralDark,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {runResult.matches ? <Check size={16} color={TOKENS.mint} /> : <X size={16} color={TOKENS.coral} />}
          {runResult.crashed ? "Робот врезался в стену — измени программу" : runResult.matches ? "Готово! Клетки совпали с заданием" : "Не совпадает с заданием — попробуй ещё раз"}
        </div>
      )}

      <textarea value={source} onChange={(e) => setSource(e.target.value)} spellCheck={false} style={codeStyle} />

      <button
        className="quest-btn"
        onClick={onRun}
        style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: TOKENS.mint, color: "#0B2F1B", fontWeight: 700, fontSize: 15, margin: "10px 0 12px" }}
      >
        Выполнить программу
      </button>

      {isSolved && (
        <div style={{ textAlign: "center", fontSize: 12, color: TOKENS.mint, marginBottom: 12 }}>
          Этот уровень уже решён — можешь потренироваться ещё раз.
        </div>
      )}

      {!showSolution ? (
        <button className="quest-btn" onClick={() => setShowSolution(true)} style={{ width: "100%", background: "transparent", color: TOKENS.textMuted, fontSize: 12, padding: "8px 0", marginBottom: 20 }}>
          Показать пример решения
        </button>
      ) : (
        <pre style={{ fontSize: 12, color: TOKENS.textMuted, background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 20, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
          {level.solution}
        </pre>
      )}
    </div>
  );
}
