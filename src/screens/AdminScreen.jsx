import { useState } from "react";
import { Pencil, Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
import { TOKENS } from "../theme.js";
import { TOPIC_META } from "../data/topics.js";
import { getEffectiveContent, getEffectiveRobotLevels, getEffectiveCodeLevels } from "../utils/contentHelpers.js";
import BackRow from "../components/BackRow.jsx";
import RobotLevelGridEditor from "../components/RobotLevelGridEditor.jsx";
import GraphDiagram from "../components/GraphDiagram.jsx";

const BASE_SECTION_LABELS = {
  theory: "Теория",
  quiz: "Квиз",
  practice: "Практика",
  final: "Итоговая проверка",
  typical: "Типовые задания",
};

function sectionLabelsForTopic(topicId) {
  if (topicId === 15) return { ...BASE_SECTION_LABELS, robotLevels: "Уровни робота" };
  if (topicId === 16) return { ...BASE_SECTION_LABELS, codeLevels: "Python-задачи" };
  return BASE_SECTION_LABELS;
}

function nextId(items) {
  return Math.max(0, ...items.map((i) => i.id || 0)) + 1;
}

function emptyItemFor(section, items) {
  if (section === "theory") return { tag: "", title: "", body: "" };
  if (section === "quiz" || section === "final") return { q: "", options: ["", ""], correct: 0, explain: "" };
  if (section === "practice") return { prompt: "", hint: "", answer: "", unit: "" };
  if (section === "robotLevels") {
    return {
      id: nextId(items),
      title: "",
      rows: 3,
      cols: 3,
      start: { row: 0, col: 0 },
      walls: [],
      target: [],
      starter: "закрасить\n# твой код",
      solution: "",
    };
  }
  if (section === "codeLevels") {
    return {
      id: nextId(items),
      title: "",
      description: "",
      starter: "",
      solution: "",
      exampleInput: "",
      exampleOutput: "",
      hiddenTests: [],
    };
  }
  return { prompt: "", answer: "", explain: "" };
}

// codeLevels хранятся с числовыми массивами (example.input/output, hidden[].input/output),
// а редактируются как строки через запятую — эти две функции переводят туда и обратно.
function codeLevelToDraft(item) {
  return {
    ...item,
    exampleInput: (item.example?.input || []).join(", "),
    exampleOutput: (item.example?.output || []).join(", "),
    hiddenTests: (item.hidden || []).map((t) => ({
      input: (t.input || []).join(", "),
      output: (t.output || []).join(", "),
    })),
  };
}
function parseNumberList(str) {
  return String(str || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}
function draftToCodeLevel(draft) {
  const { exampleInput, exampleOutput, hiddenTests, ...rest } = draft;
  return {
    ...rest,
    example: { input: parseNumberList(exampleInput), output: parseNumberList(exampleOutput) },
    hidden: (hiddenTests || []).map((t) => ({ input: parseNumberList(t.input), output: parseNumberList(t.output) })),
  };
}

export default function AdminScreen({ overrides, selectedTopic, setSelectedTopic, selectedSection, setSelectedSection, onSaveSection, onResetTopic, onImportOverrides, onExit }) {
  const content = getEffectiveContent(selectedTopic, overrides);
  const sectionLabels = sectionLabelsForTopic(selectedTopic);
  const isRobotSection = selectedTopic === 15 && selectedSection === "robotLevels";
  const isCodeSection = selectedTopic === 16 && selectedSection === "codeLevels";
  const items = isRobotSection
    ? getEffectiveRobotLevels(overrides)
    : isCodeSection
    ? getEffectiveCodeLevels(overrides)
    : content[selectedSection] || [];
  const hasOverride = !!(overrides[selectedTopic] && overrides[selectedTopic][selectedSection]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [draft, setDraft] = useState(null);

  function pickTopic(id) {
    setSelectedTopic(id);
    const labels = sectionLabelsForTopic(id);
    if (!labels[selectedSection]) setSelectedSection("theory");
    cancelEdit();
  }
  function startEdit(i) {
    setEditingIdx(i);
    const raw = JSON.parse(JSON.stringify(items[i]));
    setDraft(isCodeSection ? codeLevelToDraft(raw) : raw);
  }
  function startAdd() {
    const blank = emptyItemFor(selectedSection, items);
    setEditingIdx(items.length);
    setDraft(isCodeSection ? codeLevelToDraft(blank) : blank);
  }
  function cancelEdit() {
    setEditingIdx(null);
    setDraft(null);
  }
  function saveEdit() {
    const finalItem = isCodeSection ? draftToCodeLevel(draft) : draft;
    const next = [...items];
    if (editingIdx >= items.length) next.push(finalItem);
    else next[editingIdx] = finalItem;
    onSaveSection(selectedTopic, selectedSection, next);
    setEditingIdx(null);
    setDraft(null);
  }
  function deleteItem(i) {
    const next = items.filter((_, idx) => idx !== i);
    onSaveSection(selectedTopic, selectedSection, next);
    if (editingIdx === i) cancelEdit();
  }

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${TOKENS.border}`, background: TOKENS.bg2, color: TOKENS.text, fontSize: 14, marginBottom: 8 };
  const labelStyle = { fontSize: 11, color: TOKENS.textMuted, marginBottom: 4, display: "block" };

  return (
    <div style={{ padding: "8px 20px 0" }}>
      <BackRow onBack={onExit} label="Выйти из панели" />
      <h2 className="quest-heading" style={{ fontSize: 20, margin: "12px 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
        <ShieldCheck size={20} color={TOKENS.gold} /> Панель администратора
      </h2>
      <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: "0 0 16px" }}>
        Изменения сразу видны в приложении и сохраняются на устройстве.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {Object.keys(TOPIC_META).map(Number).sort((a, b) => a - b).map((id) => (
          <button
            key={id}
            className="quest-btn"
            onClick={() => pickTopic(id)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: id === selectedTopic ? TOKENS.gold : TOKENS.surfaceLight,
              color: id === selectedTopic ? "#3D2A02" : TOKENS.text,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {id}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {Object.keys(sectionLabels).map((sec) => (
          <button
            key={sec}
            className="quest-btn"
            onClick={() => {
              setSelectedSection(sec);
              cancelEdit();
            }}
            style={{
              padding: "7px 12px",
              borderRadius: 20,
              background: sec === selectedSection ? TOKENS.gold : TOKENS.surfaceLight,
              color: sec === selectedSection ? "#3D2A02" : TOKENS.textMuted,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {sectionLabels[sec]}
          </button>
        ))}
      </div>

      {hasOverride && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: TOKENS.surface, border: `1px solid ${TOKENS.gold}`, borderRadius: 10, padding: "8px 12px", marginBottom: 14, fontSize: 12 }}>
          <span style={{ color: TOKENS.textMuted }}>В этой теме есть правки</span>
          <button className="quest-btn" onClick={() => onResetTopic(selectedTopic)} style={{ background: "transparent", color: TOKENS.coral, fontSize: 12 }}>
            Сбросить тему к исходным
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {items.map((item, i) => (
          <div key={item.id ?? i} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: "12px 14px" }}>
            {editingIdx === i ? (
              <AdminItemForm section={selectedSection} draft={draft} setDraft={setDraft} inputStyle={inputStyle} labelStyle={labelStyle} onSave={saveEdit} onCancel={cancelEdit} />
            ) : (
              <AdminItemPreview section={selectedSection} item={item} onEdit={() => startEdit(i)} onDelete={() => deleteItem(i)} />
            )}
          </div>
        ))}
      </div>

      {editingIdx === items.length ? (
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.gold}`, borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
          <AdminItemForm section={selectedSection} draft={draft} setDraft={setDraft} inputStyle={inputStyle} labelStyle={labelStyle} onSave={saveEdit} onCancel={cancelEdit} />
        </div>
      ) : (
        <button
          className="quest-btn"
          onClick={startAdd}
          style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: TOKENS.surfaceLight, color: TOKENS.gold, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}
        >
          <Plus size={16} /> Добавить задание
        </button>
      )}

      <AdminExportImport overrides={overrides} onImport={onImportOverrides} />
    </div>
  );
}

function AdminExportImport({ overrides, onImport }) {
  const [open, setOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [copyLabel, setCopyLabel] = useState("Скопировать");
  const exportText = JSON.stringify(overrides, null, 2);
  const hasAny = Object.keys(overrides || {}).length > 0;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyLabel("Скопировано!");
      setTimeout(() => setCopyLabel("Скопировать"), 1500);
    } catch (e) {
      setCopyLabel("Не удалось скопировать");
      setTimeout(() => setCopyLabel("Скопировать"), 1500);
    }
  }
  function handleImport() {
    try {
      const parsed = JSON.parse(importText);
      if (typeof parsed !== "object" || parsed === null) throw new Error("bad shape");
      onImport(parsed);
      setImportError("");
      setImportText("");
    } catch (e) {
      setImportError("Не получилось разобрать JSON — проверь, что скопировал текст целиком.");
    }
  }

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${TOKENS.border}`, background: TOKENS.bg2, color: TOKENS.text, fontSize: 12, fontFamily: "monospace" };

  if (!open) {
    return (
      <button
        className="quest-btn"
        onClick={() => setOpen(true)}
        style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${TOKENS.border}`, color: TOKENS.textMuted, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 30 }}
      >
        <Save size={14} /> Экспорт / импорт всех правок
      </button>
    );
  }

  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: "14px", marginBottom: 30 }}>
      <div className="quest-heading" style={{ fontSize: 14, marginBottom: 10 }}>Экспорт правок</div>
      {hasAny ? (
        <>
          <textarea readOnly value={exportText} style={{ ...inputStyle, minHeight: 100, marginBottom: 8 }} onFocus={(e) => e.target.select()} />
          <button className="quest-btn" onClick={handleCopy} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: TOKENS.surfaceLight, color: TOKENS.gold, fontSize: 12, marginBottom: 16 }}>
            {copyLabel}
          </button>
        </>
      ) : (
        <p style={{ fontSize: 12, color: TOKENS.textMuted, marginBottom: 16 }}>Правок пока нет — экспортировать нечего.</p>
      )}

      <div className="quest-heading" style={{ fontSize: 14, marginBottom: 10 }}>Импорт правок</div>
      <p style={{ fontSize: 11, color: TOKENS.textMuted, marginBottom: 8 }}>
        Вставь JSON, скопированный отсюда же на другом устройстве. Это заменит текущие правки.
      </p>
      <textarea
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
        placeholder="{ ... }"
        style={{ ...inputStyle, minHeight: 100, marginBottom: 8 }}
      />
      {importError && <p style={{ color: TOKENS.coral, fontSize: 12, marginBottom: 8 }}>{importError}</p>}
      <button
        className="quest-btn"
        onClick={handleImport}
        disabled={!importText.trim()}
        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 12 }}
      >
        Загрузить правки
      </button>
      <button className="quest-btn" onClick={() => setOpen(false)} style={{ width: "100%", padding: "9px 12px", background: "transparent", color: TOKENS.textMuted, fontSize: 12, marginTop: 8 }}>
        Свернуть
      </button>
    </div>
  );
}

function AdminItemPreview({ section, item, onEdit, onDelete }) {
  return (
    <div>
      {section === "theory" && (
        <>
          <span style={{ fontSize: 11, color: TOKENS.gold }}>{item.tag}</span>
          <p style={{ fontSize: 14, fontWeight: 600, margin: "4px 0 2px" }}>{item.title}</p>
          <p style={{ fontSize: 13, color: TOKENS.textMuted, margin: 0 }}>{item.body}</p>
        </>
      )}
      {(section === "quiz" || section === "final") && (
        <>
          <p style={{ fontSize: 14, margin: "0 0 6px" }}>{item.q}</p>
          <div style={{ fontSize: 12, color: TOKENS.textMuted }}>
            {item.options.map((o, i) => (
              <div key={i} style={{ color: i === item.correct ? TOKENS.mint : TOKENS.textMuted }}>
                {i === item.correct ? "✓ " : "· "}{o}
              </div>
            ))}
          </div>
        </>
      )}
      {section === "practice" && (
        <>
          {item.graph && <span style={{ fontSize: 11, color: TOKENS.gold }}>Со схемой графа · </span>}
          <p style={{ fontSize: 14, margin: "0 0 4px" }}>{item.prompt}</p>
          <p style={{ fontSize: 12, color: TOKENS.mint, margin: 0 }}>Ответ: {item.answer} {item.unit}</p>
        </>
      )}
      {section === "typical" && (
        <>
          {item.graph && <span style={{ fontSize: 11, color: TOKENS.gold }}>Со схемой графа · </span>}
          <p style={{ fontSize: 14, margin: "0 0 4px" }}>{item.prompt}</p>
          <p style={{ fontSize: 12, color: TOKENS.mint, margin: 0 }}>Ответ: {item.answer}</p>
        </>
      )}
      {section === "robotLevels" && (
        <>
          <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>{item.title || "Без названия"}</p>
          <p style={{ fontSize: 12, color: TOKENS.textMuted, margin: 0 }}>
            Поле {item.rows}×{item.cols}, целевых клеток: {item.target.length}, стен: {(item.walls || []).length}, старт {item.start.row},{item.start.col}
          </p>
        </>
      )}
      {section === "codeLevels" && (
        <>
          <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>{item.title || "Без названия"}</p>
          <p style={{ fontSize: 12, color: TOKENS.textMuted, margin: 0 }}>
            Скрытых тестов: {(item.hidden || []).length}
          </p>
        </>
      )}
      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
        <button className="quest-btn" onClick={onEdit} style={{ background: "transparent", color: TOKENS.gold, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
          <Pencil size={13} /> Изменить
        </button>
        <button className="quest-btn" onClick={onDelete} style={{ background: "transparent", color: TOKENS.coral, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
          <Trash2 size={13} /> Удалить
        </button>
      </div>
    </div>
  );
}

function clampWalls(walls, rows, cols) {
  return walls.filter((w) => {
    const [r, c, dir] = w.split(",");
    const rr = Number(r);
    const cc = Number(c);
    if (rr >= rows || cc >= cols) return false;
    if (dir === "right" && cc + 1 >= cols) return false;
    if (dir === "down" && rr + 1 >= rows) return false;
    return true;
  });
}

function AdminItemForm({ section, draft, setDraft, inputStyle, labelStyle, onSave, onCancel }) {
  function set(field, value) {
    setDraft({ ...draft, [field]: value });
  }
  function setOption(i, value) {
    const opts = [...draft.options];
    opts[i] = value;
    setDraft({ ...draft, options: opts });
  }
  function addOption() {
    if (draft.options.length >= 4) return;
    setDraft({ ...draft, options: [...draft.options, ""] });
  }
  function removeOption(i) {
    if (draft.options.length <= 2) return;
    const opts = draft.options.filter((_, idx) => idx !== i);
    const correct = draft.correct >= opts.length ? 0 : draft.correct;
    setDraft({ ...draft, options: opts, correct });
  }

  function setGridSize(field, value) {
    const n = Math.max(1, Math.min(8, Number(value) || 1));
    const rows = field === "rows" ? n : draft.rows;
    const cols = field === "cols" ? n : draft.cols;
    const target = draft.target.filter((key) => {
      const [r, c] = key.split(",").map(Number);
      return r < rows && c < cols;
    });
    const walls = clampWalls(draft.walls, rows, cols);
    const start = { row: Math.min(draft.start.row, rows - 1), col: Math.min(draft.start.col, cols - 1) };
    setDraft({ ...draft, [field]: n, target, walls, start });
  }
  function toggleTargetCell(r, c) {
    const key = `${r},${c}`;
    const target = draft.target.includes(key) ? draft.target.filter((k) => k !== key) : [...draft.target, key];
    setDraft({ ...draft, target });
  }
  function toggleWall(r, c, dir) {
    const key = `${r},${c},${dir}`;
    const walls = draft.walls.includes(key) ? draft.walls.filter((w) => w !== key) : [...draft.walls, key];
    setDraft({ ...draft, walls });
  }
  function setStart(field, value) {
    const max = field === "row" ? draft.rows - 1 : draft.cols - 1;
    const n = Math.max(0, Math.min(max, Number(value) || 0));
    setDraft({ ...draft, start: { ...draft.start, [field]: n } });
  }

  function setHiddenTest(i, field, value) {
    const hiddenTests = [...draft.hiddenTests];
    hiddenTests[i] = { ...hiddenTests[i], [field]: value };
    setDraft({ ...draft, hiddenTests });
  }
  function addHiddenTest() {
    setDraft({ ...draft, hiddenTests: [...draft.hiddenTests, { input: "", output: "" }] });
  }
  function removeHiddenTest(i) {
    setDraft({ ...draft, hiddenTests: draft.hiddenTests.filter((_, idx) => idx !== i) });
  }

  function nextNodeId(nodes) {
    const letters = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";
    const used = new Set(nodes.map((n) => n.id));
    for (const ch of letters) if (!used.has(ch)) return ch;
    return `N${nodes.length}`;
  }
  function toggleGraph() {
    if (draft.graph) {
      const rest = { ...draft };
      delete rest.graph;
      setDraft(rest);
    } else {
      setDraft({
        ...draft,
        graph: {
          nodes: [{ id: "А", x: 20, y: 80 }, { id: "Б", x: 150, y: 80 }],
          edges: [["А", "Б"]],
        },
      });
    }
  }
  function addGraphNode() {
    const nodes = [...draft.graph.nodes, { id: nextNodeId(draft.graph.nodes), x: 80, y: 80 }];
    setDraft({ ...draft, graph: { ...draft.graph, nodes } });
  }
  function updateGraphNode(i, field, value) {
    const nodes = draft.graph.nodes.map((n, idx) => {
      if (idx !== i) return n;
      if (field === "id") return { ...n, id: value };
      return { ...n, [field]: Math.max(0, Number(value) || 0) };
    });
    const oldId = draft.graph.nodes[i].id;
    const newId = nodes[i].id;
    const edges = field === "id"
      ? draft.graph.edges.map(([a, b]) => [a === oldId ? newId : a, b === oldId ? newId : b])
      : draft.graph.edges;
    setDraft({ ...draft, graph: { ...draft.graph, nodes, edges } });
  }
  function removeGraphNode(i) {
    const id = draft.graph.nodes[i].id;
    const nodes = draft.graph.nodes.filter((_, idx) => idx !== i);
    const edges = draft.graph.edges.filter(([a, b]) => a !== id && b !== id);
    setDraft({ ...draft, graph: { ...draft.graph, nodes, edges } });
  }
  function addGraphEdge() {
    const ids = draft.graph.nodes.map((n) => n.id);
    if (ids.length < 2) return;
    setDraft({ ...draft, graph: { ...draft.graph, edges: [...draft.graph.edges, [ids[0], ids[1]]] } });
  }
  function updateGraphEdge(i, which, value) {
    const edges = draft.graph.edges.map((e, idx) => {
      if (idx !== i) return e;
      const next = [...e];
      next[which] = value;
      return next;
    });
    setDraft({ ...draft, graph: { ...draft.graph, edges } });
  }
  function removeGraphEdge(i) {
    setDraft({ ...draft, graph: { ...draft.graph, edges: draft.graph.edges.filter((_, idx) => idx !== i) } });
  }

  const graphSection = draft.graph ? (
    <div style={{ background: TOKENS.bg2, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: 10, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: TOKENS.gold }}>Схема графа</span>
        <button className="quest-btn" onClick={toggleGraph} style={{ background: "transparent", color: TOKENS.coral, fontSize: 11 }}>
          Убрать схему
        </button>
      </div>
      <GraphDiagram graph={draft.graph} />
      <label style={labelStyle}>Вершины (буква + координаты на схеме)</label>
      {draft.graph.nodes.map((n, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <input style={{ ...inputStyle, marginBottom: 0, width: 44 }} value={n.id} onChange={(e) => updateGraphNode(i, "id", e.target.value)} placeholder="А" />
          <input type="number" style={{ ...inputStyle, marginBottom: 0, width: 60 }} value={n.x} onChange={(e) => updateGraphNode(i, "x", e.target.value)} placeholder="x" />
          <input type="number" style={{ ...inputStyle, marginBottom: 0, width: 60 }} value={n.y} onChange={(e) => updateGraphNode(i, "y", e.target.value)} placeholder="y" />
          <button className="quest-btn" onClick={() => removeGraphNode(i)} style={{ background: "transparent", color: TOKENS.coral, padding: 4 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button className="quest-btn" onClick={addGraphNode} style={{ background: "transparent", color: TOKENS.gold, fontSize: 12, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
        <Plus size={13} /> Добавить вершину
      </button>
      <label style={labelStyle}>Рёбра (стрелки между вершинами)</label>
      {draft.graph.edges.map((e, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <select style={{ ...inputStyle, marginBottom: 0, flex: 1 }} value={e[0]} onChange={(ev) => updateGraphEdge(i, 0, ev.target.value)}>
            {draft.graph.nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
          </select>
          <span style={{ color: TOKENS.textMuted }}>→</span>
          <select style={{ ...inputStyle, marginBottom: 0, flex: 1 }} value={e[1]} onChange={(ev) => updateGraphEdge(i, 1, ev.target.value)}>
            {draft.graph.nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
          </select>
          <button className="quest-btn" onClick={() => removeGraphEdge(i)} style={{ background: "transparent", color: TOKENS.coral, padding: 4 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button className="quest-btn" onClick={addGraphEdge} disabled={draft.graph.nodes.length < 2} style={{ background: "transparent", color: TOKENS.gold, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
        <Plus size={13} /> Добавить ребро
      </button>
    </div>
  ) : (
    <button className="quest-btn" onClick={toggleGraph} style={{ background: "transparent", border: `1px dashed ${TOKENS.border}`, color: TOKENS.textMuted, fontSize: 12, width: "100%", padding: "8px 10px", borderRadius: 10, marginBottom: 10 }}>
      + Добавить схему графа (вершины и стрелки)
    </button>
  );

  return (
    <div>
      {section === "theory" && (
        <>
          <label style={labelStyle}>Метка</label>
          <input style={inputStyle} value={draft.tag} onChange={(e) => set("tag", e.target.value)} placeholder="Например: Бит" />
          <label style={labelStyle}>Заголовок</label>
          <input style={inputStyle} value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Заголовок карточки" />
          <label style={labelStyle}>Текст</label>
          <textarea style={{ ...inputStyle, minHeight: 70 }} value={draft.body} onChange={(e) => set("body", e.target.value)} placeholder="Объяснение" />
        </>
      )}
      {(section === "quiz" || section === "final") && (
        <>
          <label style={labelStyle}>Вопрос</label>
          <textarea style={{ ...inputStyle, minHeight: 50 }} value={draft.q} onChange={(e) => set("q", e.target.value)} placeholder="Текст вопроса" />
          <label style={labelStyle}>Варианты ответа (отметь правильный)</label>
          {draft.options.map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <input
                type="radio"
                checked={draft.correct === i}
                onChange={() => set("correct", i)}
                style={{ flexShrink: 0 }}
              />
              <input style={{ ...inputStyle, marginBottom: 0, flex: 1 }} value={o} onChange={(e) => setOption(i, e.target.value)} placeholder={`Вариант ${i + 1}`} />
              {draft.options.length > 2 && (
                <button className="quest-btn" onClick={() => removeOption(i)} style={{ background: "transparent", color: TOKENS.coral, padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {draft.options.length < 4 && (
            <button className="quest-btn" onClick={addOption} style={{ background: "transparent", color: TOKENS.gold, fontSize: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
              <Plus size={13} /> Добавить вариант
            </button>
          )}
          <label style={labelStyle}>Объяснение</label>
          <textarea style={{ ...inputStyle, minHeight: 50 }} value={draft.explain} onChange={(e) => set("explain", e.target.value)} placeholder="Почему это верный ответ" />
        </>
      )}
      {section === "practice" && (
        <>
          {graphSection}
          <label style={labelStyle}>Условие</label>
          <textarea style={{ ...inputStyle, minHeight: 50 }} value={draft.prompt} onChange={(e) => set("prompt", e.target.value)} placeholder="Текст задачи" />
          <label style={labelStyle}>Подсказка</label>
          <input style={inputStyle} value={draft.hint} onChange={(e) => set("hint", e.target.value)} placeholder="Как решать" />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Ответ</label>
              <input style={inputStyle} value={draft.answer} onChange={(e) => set("answer", e.target.value)} placeholder="Например: 24" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Единица (необязательно)</label>
              <input style={inputStyle} value={draft.unit} onChange={(e) => set("unit", e.target.value)} placeholder="бит, байт..." />
            </div>
          </div>
        </>
      )}
      {section === "typical" && (
        <>
          {graphSection}
          <label style={labelStyle}>Условие</label>
          <textarea style={{ ...inputStyle, minHeight: 50 }} value={draft.prompt} onChange={(e) => set("prompt", e.target.value)} placeholder="Текст задачи" />
          <label style={labelStyle}>Ответ</label>
          <input style={inputStyle} value={draft.answer} onChange={(e) => set("answer", e.target.value)} placeholder="Краткий проверяемый ответ" />
          <label style={labelStyle}>Объяснение</label>
          <textarea style={{ ...inputStyle, minHeight: 50 }} value={draft.explain} onChange={(e) => set("explain", e.target.value)} placeholder="Как получить ответ" />
        </>
      )}
      {section === "robotLevels" && (
        <>
          <label style={labelStyle}>Название уровня</label>
          <input style={inputStyle} value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Например: Уголок" />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Строк</label>
              <input type="number" min={1} max={8} style={inputStyle} value={draft.rows} onChange={(e) => setGridSize("rows", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Столбцов</label>
              <input type="number" min={1} max={8} style={inputStyle} value={draft.cols} onChange={(e) => setGridSize("cols", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Старт: строка</label>
              <input type="number" min={0} max={draft.rows - 1} style={inputStyle} value={draft.start.row} onChange={(e) => setStart("row", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Старт: столбец</label>
              <input type="number" min={0} max={draft.cols - 1} style={inputStyle} value={draft.start.col} onChange={(e) => setStart("col", e.target.value)} />
            </div>
          </div>
          <label style={labelStyle}>Целевые клетки и стены (клик по полю)</label>
          <RobotLevelGridEditor
            rows={draft.rows}
            cols={draft.cols}
            target={draft.target}
            walls={draft.walls}
            start={draft.start}
            onToggleCell={toggleTargetCell}
            onToggleWall={toggleWall}
          />
          <label style={labelStyle}>Стартовый код (что видит ученик)</label>
          <textarea style={{ ...inputStyle, minHeight: 70, fontFamily: "monospace" }} value={draft.starter} onChange={(e) => set("starter", e.target.value)} placeholder={"закрасить\n# твой код"} />
          <label style={labelStyle}>Решение (показывается по кнопке «Показать решение»)</label>
          <textarea style={{ ...inputStyle, minHeight: 90, fontFamily: "monospace" }} value={draft.solution} onChange={(e) => set("solution", e.target.value)} placeholder={"нц пока справа свободно\n  вправо\n  закрасить\nкц"} />
        </>
      )}
      {section === "codeLevels" && (
        <>
          <label style={labelStyle}>Название задачи</label>
          <input style={inputStyle} value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Например: Сумма кратных 7" />
          <label style={labelStyle}>Условие</label>
          <textarea style={{ ...inputStyle, minHeight: 70 }} value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="Текст задачи" />
          <label style={labelStyle}>Стартовый код (что видит ученик)</label>
          <textarea style={{ ...inputStyle, minHeight: 80, fontFamily: "monospace" }} value={draft.starter} onChange={(e) => set("starter", e.target.value)} placeholder={"n = int(input())\n# твой код"} />
          <label style={labelStyle}>Решение (показывается по кнопке «Показать решение»)</label>
          <textarea style={{ ...inputStyle, minHeight: 80, fontFamily: "monospace" }} value={draft.solution} onChange={(e) => set("solution", e.target.value)} />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Пример: вход (через запятую)</label>
              <input style={inputStyle} value={draft.exampleInput} onChange={(e) => set("exampleInput", e.target.value)} placeholder="4, 10, 25, 7, 30" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Пример: выход (через запятую)</label>
              <input style={inputStyle} value={draft.exampleOutput} onChange={(e) => set("exampleOutput", e.target.value)} placeholder="30" />
            </div>
          </div>
          <label style={labelStyle}>Скрытые тесты (не видны ученику, проверяют решение)</label>
          {draft.hiddenTests.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <input style={{ ...inputStyle, marginBottom: 0, flex: 1 }} value={t.input} onChange={(e) => setHiddenTest(i, "input", e.target.value)} placeholder="вход" />
              <input style={{ ...inputStyle, marginBottom: 0, flex: 1 }} value={t.output} onChange={(e) => setHiddenTest(i, "output", e.target.value)} placeholder="выход" />
              <button className="quest-btn" onClick={() => removeHiddenTest(i)} style={{ background: "transparent", color: TOKENS.coral, padding: 4 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="quest-btn" onClick={addHiddenTest} style={{ background: "transparent", color: TOKENS.gold, fontSize: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <Plus size={13} /> Добавить скрытый тест
          </button>
        </>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="quest-btn" onClick={onSave} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Save size={14} /> Сохранить
        </button>
        <button className="quest-btn" onClick={onCancel} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: TOKENS.surfaceLight, color: TOKENS.textMuted, fontSize: 13 }}>
          Отмена
        </button>
      </div>
    </div>
  );
}
