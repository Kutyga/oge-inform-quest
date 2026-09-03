import { Clock, Flame, Lock, Pencil, Star, Check, RotateCcw } from "lucide-react";
import { TOKENS } from "../theme.js";
import { TOPIC_META } from "../data/topics.js";
import { TOPIC_CONTENT } from "../data/content.js";
import { getTopicProgress, isUnlocked, todayStr } from "../utils/progress.js";

export default function MapScreen({ progress, onEnter, onExam, onMarathon, onStart, onNotes }) {
  const ids = Object.keys(TOPIC_META).map(Number);
  return (
    <div style={{ padding: "8px 20px 0" }}>
      <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: "0 0 16px" }}>
        Карта тем ОГЭ. Проходи темы по порядку — за звёзды в предыдущей теме открывается следующая.
      </p>

      <button
        className="quest-btn"
        onClick={onExam}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          width: "100%",
          background: TOKENS.surface,
          border: `2px solid ${TOKENS.coral}`,
          borderRadius: 14,
          padding: "14px 16px",
          textAlign: "left",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: TOKENS.coral,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Clock size={20} color="#3D0F0A" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="quest-heading" style={{ fontWeight: 600, fontSize: 16 }}>Экзамен</div>
          <div style={{ fontSize: 12, color: TOKENS.textMuted, marginTop: 2 }}>
            15 заданий по порядку ФИПИ, 60 минут, сразу балл
          </div>
        </div>
        {progress.examBest && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Лучший результат</div>
            <div className="quest-heading" style={{ fontSize: 15, color: TOKENS.coral }}>
              {progress.examBest.score}/{progress.examBest.total}
            </div>
          </div>
        )}
      </button>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          className="quest-btn"
          onClick={onMarathon}
          style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "transparent", border: `1px dashed ${TOKENS.coral}`, borderRadius: 12, padding: "10px 12px", textAlign: "left" }}
        >
          <Flame size={16} color={TOKENS.coral} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Марафон</div>
            <div style={{ fontSize: 11, color: TOKENS.textMuted }}>3 экзамена подряд</div>
          </div>
        </button>
        <button
          className="quest-btn"
          onClick={onNotes}
          style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "transparent", border: `1px dashed ${TOKENS.gold}`, borderRadius: 12, padding: "10px 12px", textAlign: "left" }}
        >
          <Pencil size={16} color={TOKENS.gold} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Шпаргалка</div>
            <div style={{ fontSize: 11, color: TOKENS.textMuted }}>Заметки и справочник</div>
          </div>
        </button>
      </div>

      <DailyReviewCard progress={progress} onStart={onStart} />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ids.map((num) => {
          const meta = TOPIC_META[num];
          const hasContent = !!TOPIC_CONTENT[num];
          const unlocked = hasContent && isUnlocked(progress, num);
          const tp = getTopicProgress(progress, num);
          if (unlocked) {
            return (
              <button
                key={num}
                className="quest-btn"
                onClick={() => onEnter(num)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: TOKENS.surface,
                  border: `2px solid ${TOKENS.gold}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: TOKENS.gold,
                    color: "#3D2A02",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 18,
                    flexShrink: 0,
                    fontFamily: "'Fredoka', sans-serif",
                  }}
                >
                  {num}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="quest-heading" style={{ fontWeight: 600, fontSize: 16 }}>
                    {meta.title}
                  </div>
                  <div style={{ fontSize: 12, color: TOKENS.textMuted, marginTop: 2 }}>{meta.subtitle}</div>
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  {[0, 1, 2].map((s) => (
                    <Star key={s} size={16} fill={s < tp.stars ? TOKENS.gold : "none"} color={TOKENS.gold} />
                  ))}
                </div>
              </button>
            );
          }
          return (
            <div
              key={num}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                border: `1px solid ${TOKENS.border}`,
                borderRadius: 14,
                padding: "14px 16px",
                opacity: 0.5,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: TOKENS.surface,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Lock size={18} color={TOKENS.textMuted} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="quest-heading" style={{ fontWeight: 600, fontSize: 15 }}>
                  {meta.title}
                </div>
                <div style={{ fontSize: 12, color: TOKENS.textMuted, marginTop: 2 }}>
                  {hasContent ? "Открой предыдущую тему" : "Скоро открою"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DailyReviewCard({ progress, onStart }) {
  const today = todayStr();
  const done = progress.dailyReview?.lastDate === today;
  const eligibleCount = Object.keys(progress.topics || {}).filter(
    (id) => TOPIC_CONTENT[Number(id)] && getTopicProgress(progress, Number(id)).theoryDone
  ).length;
  const streakDays = progress.dailyReview?.streakDays || 0;

  if (eligibleCount === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "transparent", border: `1px dashed ${TOKENS.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 20, opacity: 0.6 }}>
        <RotateCcw size={20} color={TOKENS.textMuted} />
        <div style={{ fontSize: 12, color: TOKENS.textMuted }}>
          Восстановление знаний откроется, когда пройдёшь теорию хотя бы одной темы.
        </div>
      </div>
    );
  }

  return (
    <button
      className="quest-btn"
      onClick={done ? undefined : onStart}
      disabled={done}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        background: TOKENS.surface,
        border: `2px solid ${done ? TOKENS.mint : TOKENS.mint}`,
        borderRadius: 14,
        padding: "14px 16px",
        textAlign: "left",
        marginBottom: 20,
        opacity: done ? 0.75 : 1,
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: TOKENS.mintDark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {done ? <Check size={20} color={TOKENS.mint} /> : <RotateCcw size={20} color={TOKENS.mint} />}
      </div>
      <div style={{ flex: 1 }}>
        <div className="quest-heading" style={{ fontWeight: 600, fontSize: 16 }}>Восстановление знаний</div>
        <div style={{ fontSize: 12, color: TOKENS.textMuted, marginTop: 2 }}>
          {done ? `Пройдено сегодня — заходи завтра` : `Тест по ${eligibleCount} пройденным темам, слабые — в приоритете`}
        </div>
      </div>
      {streakDays > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: TOKENS.mint }}>
          <Flame size={16} />
          <span className="quest-heading" style={{ fontSize: 14 }}>{streakDays}</span>
        </div>
      )}
    </button>
  );
}
