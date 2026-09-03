import { Check, Target, X } from "lucide-react";
import { TOKENS } from "../theme.js";
import { TOPIC_META } from "../data/topics.js";
import BackRow from "../components/BackRow.jsx";
import StatCard from "../components/StatCard.jsx";

export default function StatsScreen({ mistakes, onBack }) {
  const ids = Object.keys(TOPIC_META).map(Number).sort((a, b) => a - b);
  const rows = ids
    .map((id) => {
      const m = mistakes[id] || { correct: 0, wrong: 0 };
      const total = m.correct + m.wrong;
      const accuracy = total > 0 ? Math.round((m.correct / total) * 100) : null;
      return { id, title: TOPIC_META[id].title, correct: m.correct, wrong: m.wrong, total, accuracy };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100));

  const totalCorrect = rows.reduce((s, r) => s + r.correct, 0);
  const totalWrong = rows.reduce((s, r) => s + r.wrong, 0);
  const totalAll = totalCorrect + totalWrong;
  const overallAccuracy = totalAll > 0 ? Math.round((totalCorrect / totalAll) * 100) : 0;

  return (
    <div style={{ padding: "8px 20px 0" }}>
      <BackRow onBack={onBack} label="Личный кабинет" />
      <h2 className="quest-heading" style={{ fontSize: 20, margin: "12px 0 4px" }}>Статистика ошибок</h2>
      <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: "0 0 18px" }}>
        Копится за всё время — по квизам, итоговым проверкам, типовым заданиям, экзаменам и восстановлению знаний.
      </p>

      {totalAll === 0 ? (
        <p style={{ color: TOKENS.textMuted, fontSize: 14 }}>Пока нет данных — пройди хотя бы один квиз или задание.</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
            <StatCard icon={Check} label="Верно" value={totalCorrect} />
            <StatCard icon={X} label="Ошибок" value={totalWrong} />
            <StatCard icon={Target} label="Точность" value={`${overallAccuracy}%`} />
          </div>

          <div className="quest-heading" style={{ fontSize: 14, marginBottom: 10 }}>По темам (сначала слабые места)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 20 }}>
            {rows.map((r) => (
              <div key={r.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.id}. {r.title}</span>
                  <span style={{ fontSize: 13, color: r.accuracy >= 80 ? TOKENS.mint : r.accuracy >= 50 ? TOKENS.gold : TOKENS.coral, fontWeight: 700 }}>
                    {r.accuracy}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: TOKENS.surfaceLight, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: `${r.accuracy}%`, background: r.accuracy >= 80 ? TOKENS.mint : r.accuracy >= 50 ? TOKENS.gold : TOKENS.coral }} />
                </div>
                <div style={{ fontSize: 11, color: TOKENS.textMuted }}>
                  {r.correct} верно · {r.wrong} ошибок · {r.total} всего
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
