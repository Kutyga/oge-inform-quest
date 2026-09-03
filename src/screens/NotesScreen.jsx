import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { TOKENS } from "../theme.js";
import { TOPIC_META } from "../data/topics.js";
import { TOPIC_CONTENT } from "../data/content.js";
import BackRow from "../components/BackRow.jsx";

export default function NotesScreen({ notes, onAdd, onDelete, onBack }) {
  const [tab, setTab] = useState("mine");
  const [titleDraft, setTitleDraft] = useState("");
  const [textDraft, setTextDraft] = useState("");

  const referenceRows = Object.keys(TOPIC_META)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((id) => TOPIC_CONTENT[id])
    .map((id) => ({ id, title: TOPIC_META[id].title, cards: TOPIC_CONTENT[id].theory }));

  function handleAdd() {
    onAdd(titleDraft, textDraft);
    setTitleDraft("");
    setTextDraft("");
  }

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${TOKENS.border}`, background: TOKENS.bg2, color: TOKENS.text, fontSize: 14, marginBottom: 8 };

  return (
    <div style={{ padding: "8px 20px 0" }}>
      <BackRow onBack={onBack} label="Карта тем" />
      <h2 className="quest-heading" style={{ fontSize: 20, margin: "12px 0 4px" }}>Шпаргалка</h2>
      <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: "0 0 16px" }}>
        Личные заметки и быстрый справочник по всем темам — под рукой в любой момент.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        <button
          className="quest-btn"
          onClick={() => setTab("mine")}
          style={{ flex: 1, padding: "9px 12px", borderRadius: 10, background: tab === "mine" ? TOKENS.gold : TOKENS.surfaceLight, color: tab === "mine" ? "#3D2A02" : TOKENS.textMuted, fontSize: 13, fontWeight: 600 }}
        >
          Мои заметки
        </button>
        <button
          className="quest-btn"
          onClick={() => setTab("reference")}
          style={{ flex: 1, padding: "9px 12px", borderRadius: 10, background: tab === "reference" ? TOKENS.gold : TOKENS.surfaceLight, color: tab === "reference" ? "#3D2A02" : TOKENS.textMuted, fontSize: 13, fontWeight: 600 }}
        >
          Справочник
        </button>
      </div>

      {tab === "mine" ? (
        <>
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
            <input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} placeholder="Заголовок (например, «Формула для ИЛИ»)" style={inputStyle} />
            <textarea value={textDraft} onChange={(e) => setTextDraft(e.target.value)} placeholder="Текст заметки" style={{ ...inputStyle, minHeight: 70 }} />
            <button className="quest-btn" onClick={handleAdd} disabled={!textDraft.trim()} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Plus size={14} /> Добавить заметку
            </button>
          </div>

          {notes.length === 0 ? (
            <p style={{ color: TOKENS.textMuted, fontSize: 13, textAlign: "center" }}>Заметок пока нет — добавь первую выше.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 20 }}>
              {notes.map((n) => (
                <div key={n.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TOKENS.gold }}>{n.title}</div>
                    <button className="quest-btn" onClick={() => onDelete(n.id)} style={{ background: "transparent", color: TOKENS.coral, padding: 2, flexShrink: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p style={{ fontSize: 13, color: TOKENS.text, margin: "6px 0 0", whiteSpace: "pre-wrap" }}>{n.text}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 20 }}>
          {referenceRows.map((row) => (
            <div key={row.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: "12px 14px" }}>
              <div className="quest-heading" style={{ fontSize: 14, marginBottom: 8 }}>{row.id}. {row.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {row.cards.map((c, i) => (
                  <div key={i} style={{ fontSize: 12, color: TOKENS.textMuted }}>
                    <span style={{ color: TOKENS.gold, fontWeight: 600 }}>{c.tag}</span> — {c.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
