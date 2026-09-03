import { TOKENS } from "../theme.js";

export default function StatCard({ icon, label, value }) {
  const Icon = icon;
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Icon size={14} color={TOKENS.gold} />
        <span style={{ fontSize: 12, color: TOKENS.textMuted }}>{label}</span>
      </div>
      <div className="quest-heading" style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  );
}