import { useState } from "react";
import { Users, Flame, Sparkles, TrendingUp, ShieldCheck, ShieldOff, ChevronRight } from "lucide-react";
import { TOKENS } from "../theme.js";
import BackRow from "../components/BackRow.jsx";
import StatCard from "../components/StatCard.jsx";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function RoleControl({ user, isSelf, onToggleRole }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const makingAdmin = user.role !== "admin";

  if (isSelf) {
    return <div style={{ fontSize: 11, color: TOKENS.textMuted, marginTop: 6 }}>Это ты — роль меняется другим админом</div>;
  }

  async function handleConfirm() {
    setBusy(true);
    setErr("");
    try {
      await onToggleRole(user.id, makingAdmin ? "admin" : "user");
      setConfirming(false);
    } catch (e) {
      setErr(e.message || "Не получилось сохранить");
    } finally {
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        className="quest-btn"
        onClick={() => setConfirming(true)}
        style={{ marginTop: 6, background: "transparent", color: makingAdmin ? TOKENS.gold : TOKENS.coral, fontSize: 11, display: "flex", alignItems: "center", gap: 4, padding: 0 }}
      >
        {makingAdmin ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
        {makingAdmin ? "Сделать админом" : "Снять права админа"}
      </button>
    );
  }

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="quest-btn"
          onClick={handleConfirm}
          disabled={busy}
          style={{ padding: "5px 10px", borderRadius: 8, background: makingAdmin ? TOKENS.gold : TOKENS.coral, color: makingAdmin ? "#3D2A02" : "#3D0F0A", fontWeight: 700, fontSize: 11, opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "…" : makingAdmin ? "Да, сделать админом" : "Да, снять права"}
        </button>
        <button className="quest-btn" onClick={() => setConfirming(false)} style={{ padding: "5px 10px", borderRadius: 8, background: TOKENS.surfaceLight, color: TOKENS.textMuted, fontSize: 11 }}>
          Отмена
        </button>
      </div>
      {err && <div style={{ color: TOKENS.coral, fontSize: 11, marginTop: 4 }}>{err}</div>}
    </div>
  );
}

export default function AdminStatsScreen({ loading, error, stats, currentUserId, onToggleRole, onOpenUser, onBack }) {
  return (
    <div style={{ padding: "8px 20px 0" }}>
      <BackRow onBack={onBack} label="Панель администратора" />
      <h2 className="quest-heading" style={{ fontSize: 20, margin: "12px 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
        <TrendingUp size={20} color={TOKENS.gold} /> Статистика по пользователям
      </h2>

      {loading && <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: "20px 0" }}>Загружаю данные всех пользователей…</p>}

      {error && (
        <div style={{ padding: "10px 12px", borderRadius: 10, background: TOKENS.coralDark, fontSize: 13, marginBottom: 16 }}>
          Не удалось загрузить статистику: {error}
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
            <StatCard icon={Users} label="Всего пользователей" value={stats.overview.totalUsers} />
            <StatCard icon={Flame} label="Активны за неделю" value={stats.overview.activeUsers} />
            <StatCard icon={Sparkles} label="Средний XP" value={stats.overview.avgXp} />
            <StatCard icon={TrendingUp} label="Средняя серия дней" value={stats.overview.avgStreak} />
          </div>

          <div className="quest-heading" style={{ fontSize: 15, marginBottom: 10 }}>Самые слабые темы</div>
          {stats.weakTopics.length === 0 ? (
            <p style={{ color: TOKENS.textMuted, fontSize: 13, marginBottom: 20 }}>
              Пока недостаточно данных (нужно хотя бы несколько ответов по теме от пользователей).
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {stats.weakTopics.slice(0, 8).map((t) => {
                const pct = Math.round(t.accuracy * 100);
                const color = pct < 50 ? TOKENS.coral : pct < 75 ? TOKENS.gold : TOKENS.mint;
                return (
                  <div key={t.topicId} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>Тема {t.topicId}. {t.title}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: TOKENS.bg2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: color }} />
                    </div>
                    <div style={{ fontSize: 11, color: TOKENS.textMuted, marginTop: 4 }}>{t.total} ответов всего</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="quest-heading" style={{ fontSize: 15, marginBottom: 10 }}>Пользователи ({stats.users.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 30 }}>
            {stats.users.map((u) => (
              <div key={u.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: "10px 12px" }}>
                <button
                  className="quest-btn"
                  onClick={() => onOpenUser(u.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "transparent", padding: 0, textAlign: "left", color: TOKENS.text }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.name} {u.role === "admin" && <ShieldCheck size={12} color={TOKENS.gold} />}
                    </div>
                    <div style={{ fontSize: 11, color: TOKENS.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: TOKENS.gold, fontWeight: 700 }}>{u.xp} XP</div>
                    <div style={{ fontSize: 11, color: TOKENS.textMuted }}>серия {u.streak} · {formatDate(u.updatedAt)}</div>
                  </div>
                  <ChevronRight size={16} color={TOKENS.textMuted} style={{ flexShrink: 0 }} />
                </button>
                <RoleControl user={u} isSelf={u.id === currentUserId} onToggleRole={onToggleRole} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
