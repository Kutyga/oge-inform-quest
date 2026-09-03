// Агрегация прогресса всех пользователей для экрана статистики админа.
// Чистая функция: progressRows/profileRows — сырые строки из Supabase
// (progress: user_id/data/updated_at; profiles: id/email/name/role).
import { TOPIC_META } from "../data/topics.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_ATTEMPTS_FOR_TOPIC = 5;

export function computeAdminStats(progressRows, profileRows) {
  const profileById = new Map(profileRows.map((p) => [p.id, p]));
  const now = Date.now();

  let totalXp = 0;
  let totalStreak = 0;
  let activeCount = 0;
  const mistakesByTopic = {};

  const users = progressRows
    .map((row) => {
      const d = row.data || {};
      const xp = d.xp || 0;
      const streak = d.streak?.count || 0;
      totalXp += xp;
      totalStreak += streak;
      const isActive = !!row.updated_at && now - new Date(row.updated_at).getTime() <= WEEK_MS;
      if (isActive) activeCount++;

      Object.entries(d.mistakes || {}).forEach(([topicId, m]) => {
        const cur = mistakesByTopic[topicId] || { correct: 0, wrong: 0 };
        mistakesByTopic[topicId] = {
          correct: cur.correct + (m.correct || 0),
          wrong: cur.wrong + (m.wrong || 0),
        };
      });

      const profile = profileById.get(row.user_id);
      return {
        id: row.user_id,
        email: profile?.email || "—",
        name: profile?.name || d.profile?.name || "—",
        role: profile?.role || "user",
        xp,
        streak,
        updatedAt: row.updated_at || null,
      };
    })
    .sort((a, b) => b.xp - a.xp);

  const overview = {
    totalUsers: profileRows.length,
    activeUsers: activeCount,
    avgXp: users.length ? Math.round(totalXp / users.length) : 0,
    avgStreak: users.length ? Math.round((totalStreak / users.length) * 10) / 10 : 0,
  };

  const weakTopics = Object.entries(mistakesByTopic)
    .map(([topicId, m]) => {
      const total = m.correct + m.wrong;
      return {
        topicId: Number(topicId),
        title: TOPIC_META[topicId]?.title || `Тема ${topicId}`,
        total,
        accuracy: total > 0 ? m.correct / total : 0,
      };
    })
    .filter((t) => t.total >= MIN_ATTEMPTS_FOR_TOPIC)
    .sort((a, b) => a.accuracy - b.accuracy);

  return { overview, weakTopics, users };
}
