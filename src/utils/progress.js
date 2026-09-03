// Форма объекта прогресса пользователя и производные от него вычисления
// (какая тема разблокирована, какие достижения открыты и т.д.).
import { TOPIC_ORDER } from "../data/topics.js";
import { ACHIEVEMENTS } from "../data/achievements.js";

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
export function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function defaultProgress() {
  return {
    xp: 0,
    profile: { name: "Игрок", avatar: "User" },
    settings: { soundOn: true },
    streak: { count: 0, lastDate: null },
    achievements: [],
    topics: {},
    examBest: null,
    mistakes: {},
    dailyReview: { lastDate: null, streakDays: 0, history: [] },
    robotLevelsSolved: [],
    codeLevelsSolved: [],
    marathonBest: null,
    notes: [],
  };
}
export function bumpMistakes(mistakes, topicId, correctDelta, wrongDelta) {
  const m = mistakes || {};
  const cur = m[topicId] || { correct: 0, wrong: 0 };
  return { ...m, [topicId]: { correct: cur.correct + correctDelta, wrong: cur.wrong + wrongDelta } };
}
export function bumpMistakesFromAnswers(mistakes, answers) {
  let m = mistakes || {};
  const byTopic = {};
  answers.forEach((a) => {
    if (!byTopic[a.topicId]) byTopic[a.topicId] = { correct: 0, wrong: 0 };
    if (a.correct) byTopic[a.topicId].correct++;
    else byTopic[a.topicId].wrong++;
  });
  Object.entries(byTopic).forEach(([id, delta]) => {
    m = bumpMistakes(m, Number(id), delta.correct, delta.wrong);
  });
  return m;
}
export function getTopicProgress(progress, id) {
  return progress.topics[id] || { theoryDone: false, quizBest: 0, practiceDone: false, finalBest: 0, stars: 0 };
}
export function isUnlocked(progress, id) {
  const idx = TOPIC_ORDER.indexOf(id);
  if (idx === -1) return false;
  if (idx === 0) return true;
  const prevId = TOPIC_ORDER[idx - 1];
  return getTopicProgress(progress, prevId).stars > 0;
}
export function computeUnlockedAchievements(progress, overrides) {
  return ACHIEVEMENTS.filter((a) => a.check(progress, overrides)).map((a) => a.id);
}
