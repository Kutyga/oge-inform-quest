import { TOKENS } from "../theme.js";

// Кликабельная сетка для редактирования уровня Робота в админке:
// - клик по клетке переключает её присутствие в массиве target;
// - клик по узкой полоске между соседними клетками переключает стену
//   (канонично хранится как "r,c,right" / "r,c,down" — см. utils/robotInterpreter.js).
function trackList(n, cellSize, gapSize) {
  const tracks = [];
  for (let i = 0; i < n; i++) {
    tracks.push(`${cellSize}px`);
    if (i < n - 1) tracks.push(`${gapSize}px`);
  }
  return tracks.join(" ");
}

export default function RobotLevelGridEditor({ rows, cols, target, walls, start, onToggleCell, onToggleWall }) {
  const targetSet = new Set(target);
  const wallSet = new Set(walls);
  const CELL = 36;
  const GAP = 10;

  const items = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      const isTarget = targetSet.has(key);
      const isStart = start.row === r && start.col === c;
      items.push(
        <button
          key={`cell-${key}`}
          type="button"
          onClick={() => onToggleCell(r, c)}
          style={{
            gridColumn: 2 * c + 1,
            gridRow: 2 * r + 1,
            width: CELL,
            height: CELL,
            borderRadius: 6,
            background: isTarget ? TOKENS.surface : TOKENS.bg2,
            border: `2px solid ${isTarget ? TOKENS.gold : TOKENS.border}`,
            color: isStart ? TOKENS.mint : TOKENS.textMuted,
            fontSize: 10,
            fontWeight: 700,
            cursor: "pointer",
          }}
          title={key}
        >
          {isStart ? "СТАРТ" : ""}
        </button>
      );
      if (c < cols - 1) {
        const wallKey = `${r},${c},right`;
        const on = wallSet.has(wallKey);
        items.push(
          <button
            key={`wr-${key}`}
            type="button"
            onClick={() => onToggleWall(r, c, "right")}
            title="Стена справа"
            style={{
              gridColumn: 2 * c + 2,
              gridRow: 2 * r + 1,
              width: GAP,
              height: CELL,
              padding: 0,
              border: "none",
              borderRadius: 2,
              background: on ? TOKENS.coral : "transparent",
              cursor: "pointer",
            }}
          />
        );
      }
      if (r < rows - 1) {
        const wallKey = `${r},${c},down`;
        const on = wallSet.has(wallKey);
        items.push(
          <button
            key={`wd-${key}`}
            type="button"
            onClick={() => onToggleWall(r, c, "down")}
            title="Стена снизу"
            style={{
              gridColumn: 2 * c + 1,
              gridRow: 2 * r + 2,
              width: CELL,
              height: GAP,
              padding: 0,
              border: "none",
              borderRadius: 2,
              background: on ? TOKENS.coral : "transparent",
              cursor: "pointer",
            }}
          />
        );
      }
    }
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: trackList(cols, CELL, GAP),
          gridTemplateRows: trackList(rows, CELL, GAP),
          gap: 0,
          justifyContent: "center",
          margin: "8px 0",
        }}
      >
        {items}
      </div>
      <p style={{ fontSize: 11, color: TOKENS.textMuted, textAlign: "center", margin: "0 0 8px" }}>
        Клик по клетке — целевая (золотая рамка). Клик по узкой полоске между клетками — стена (красная).
        Клетка старта задаётся полями ниже.
      </p>
    </div>
  );
}
