import { Sparkles, Flame, Star, Target, ShieldCheck, Trophy, Bot, Code2, CalendarCheck, StickyNote } from "lucide-react";
import { TOKENS } from "../theme.js";
import BackRow from "../components/BackRow.jsx";
import StatCard from "../components/StatCard.jsx";
import { ACHIEVEMENTS } from "../data/achievements.js";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function pct(value) {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

function accuracyColor(value) {
  if (value === null) return TOKENS.textMuted;
  if (value < 0.5) return TOKENS.coral;
  if (value < 0.75) return TOKENS.gold;
  return TOKENS.mint;
}

function Stars({ count }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[0, 1, 2].map((i) => (
        <Star key={i} size={11} color={i < count ? TOKENS.gold : TOKENS.border} fill={i < count ? TOKENS.gold : "none"} />
      ))}
    </span>
  );
}

function Row({ label, value, muted }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "6px 0", borderBottom: `1px solid ${TOKENS.border}` }}>
      <span style={{ fontSize: 12, color: TOKENS.textMuted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: muted ? TOKENS.textMuted : TOKENS.text, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default function AdminUserScreen({ user, detail, onBack }) {
  if (!user || !detail) return null;

  const unlocked = new Set(detail.achievements);
  const startedTopics = detail.topics.filter((t) => t.started);

  return (
    <div style={{ padding: "8px 20px 0" }}>
      <BackRow onBack={onBack} label="К списку пользователей" />

      <h2 className="quest-heading" style={{ fontSize: 20, margin: "12px 0 2px", display: "flex", alignItems: "center", gap: 8 }}>
        {user.name}
        {user.role === "admin" && <ShieldCheck size={16} color={TOKENS.gold} />}
      </h2>
      <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: "0 0 4px", wordBreak: "break-all" }}>{user.email}</p>
      <p style={{ color: TOKENS.textMuted, fontSize: 12, margin: "0 0 18px" }}>
        Последняя активность: {formatDate(user.updatedAt)}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
        <StatCard icon={Sparkles} label="Опыт" value={`${detail.xp} XP`} />
        <StatCard icon={Flame} label="Серия дней" value={detail.streak} />
        <StatCard icon={Star} label="Звёзд за темы" value={`${detail.starsTotal} / ${detail.starsMax}`} />
        <StatCard icon={Target} label="Точность ответов" value={pct(detail.accuracy)} />
      </div>

      <div className="quest-heading" style={{ fontSize: 15, marginBottom: 8 }}>Общее</div>
      <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: "6px 14px 10px", marginBottom: 22 }}>
        <Row label="Начато тем" value={`${detail.topicsStarted} из ${detail.topicsTotal}`} />
        <Row label="Всего ответов" value={detail.answered} />
        <Row label="Верных / неверных" value={`${detail.correct} / ${detail.wrong}`} />
        <Row label="Лучший результат экзамена" value={detail.examBest === null ? "не проходил" : detail.examBest} muted={detail.examBest === null} />
        <Row label="Рекорд марафона" value={detail.marathonBest === null ? "не проходил" : detail.marathonBest} muted={detail.marathonBest === null} />
        <Row label="Ежедневная тренировка" value={detail.dailyLastDate ? `серия ${detail.dailyStreak}, последняя ${formatDate(detail.dailyLastDate)}` : "не начинал"} muted={!detail.dailyLastDate} />
      </div>

      <div className="quest-heading" style={{ fontSize: 15, marginBottom: 8 }}>Практические блоки</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
        <StatCard icon={Bot} label="Уровней робота" value={detail.robotSolved} />
        <StatCard icon={Code2} label="Задач на Python" value={detail.codeSolved} />
        <StatCard icon={CalendarCheck} label="Серия тренировок" value={detail.dailyStreak} />
        <StatCard icon={StickyNote} label="Заметок" value={detail.notesCount} />
      </div>

      {detail.weakTopics.length > 0 && (
        <>
          <div className="quest-heading" style={{ fontSize: 15, marginBottom: 8 }}>Где больше всего ошибок</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
            {detail.weakTopics.map((t) => {
              const color = accuracyColor(t.accuracy);
              return (
                <div key={t.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 10 }}>
                    <span style={{ fontSize: 13 }}>Тема {t.id}. {t.title}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>{pct(t.accuracy)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: TOKENS.bg2, overflow: "hidden" }}>
                    <div style={{ width: `${Math.round(t.accuracy * 100)}%`, height: "100%", background: color }} />
                  </div>
                  <div style={{ fontSize: 11, color: TOKENS.textMuted, marginTop: 4 }}>
                    неверных {t.wrong} из {t.total}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="quest-heading" style={{ fontSize: 15, marginBottom: 8 }}>Прогресс по темам</div>
      {startedTopics.length === 0 ? (
        <p style={{ color: TOKENS.textMuted, fontSize: 13, marginBottom: 22 }}>Пользователь ещё не начал ни одной темы.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 22 }}>
          {startedTopics.map((t) => (
            <div key={t.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: "9px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Тема {t.id}. {t.title}
                </span>
                <Stars count={t.stars} />
              </div>
              <div style={{ fontSize: 11, color: TOKENS.textMuted, display: "flex", flexWrap: "wrap", gap: 10 }}>
                <span>теория: {t.theoryDone ? "пройдена" : "нет"}</span>
                <span>практика: {t.practiceDone ? "пройдена" : "нет"}</span>
                <span>квиз: {t.quizBest}</span>
                <span>итог: {t.finalBest}</span>
                {t.total > 0 && (
                  <span style={{ color: accuracyColor(t.accuracy) }}>
                    ответы: {t.correct}/{t.total} ({pct(t.accuracy)})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="quest-heading" style={{ fontSize: 15, marginBottom: 8 }}>
        Достижения ({detail.achievements.length} из {ACHIEVEMENTS.length})
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 30 }}>
        {ACHIEVEMENTS.map((a) => {
          const has = unlocked.has(a.id);
          const Icon = a.icon || Trophy;
          return (
            <div
              key={a.id}
              title={a.desc}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 20,
                background: has ? TOKENS.surfaceLight : "transparent",
                border: `1px solid ${has ? TOKENS.gold : TOKENS.border}`,
                color: has ? TOKENS.text : TOKENS.textMuted,
                fontSize: 12,
                opacity: has ? 1 : 0.55,
              }}
            >
              <Icon size={13} color={has ? TOKENS.gold : TOKENS.textMuted} />
              {a.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}
