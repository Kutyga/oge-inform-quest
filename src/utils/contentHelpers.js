// Сборка наборов вопросов из контента тем (с учётом правок из админки)
// для экзамена и ежедневного повторения.
import { TOPIC_META } from "../data/topics.js";
import { TOPIC_CONTENT } from "../data/content.js";
import { ROBOT_LEVELS } from "../data/robotLevels.js";
import { CODE_LEVELS } from "../data/codeLevels.js";
import { shuffleArray } from "./answers.js";
import { getTopicProgress } from "./progress.js";

export function getEffectiveContent(topicId, overrides) {
  const base = TOPIC_CONTENT[topicId];
  const ov = (overrides && overrides[topicId]) || {};
  return {
    theory: ov.theory || base.theory,
    quiz: ov.quiz || base.quiz,
    practice: ov.practice || base.practice,
    final: ov.final || base.final,
    typical: ov.typical || base.typical,
  };
}
export function getEffectiveRobotLevels(overrides) {
  const ov = overrides?.[15]?.robotLevels;
  return ov && ov.length > 0 ? ov : ROBOT_LEVELS;
}
export function getEffectiveCodeLevels(overrides) {
  const ov = overrides?.[16]?.codeLevels;
  return ov && ov.length > 0 ? ov : CODE_LEVELS;
}
export function buildExamSet(overrides) {
  const ids = Object.keys(TOPIC_META).map(Number).sort((a, b) => a - b);
  return ids
    .filter((id) => !!TOPIC_CONTENT[id])
    .map((id) => {
      const pool = getEffectiveContent(id, overrides).typical || [];
      if (pool.length === 0) return null;
      const item = pool[Math.floor(Math.random() * pool.length)];
      return { topicId: id, prompt: item.prompt, answer: item.answer, explain: item.explain, graph: item.graph };
    })
    .filter(Boolean);
}
export function buildDailySet(progress, overrides) {
  const touchedIds = Object.keys(progress.topics || {})
    .map(Number)
    .filter((id) => TOPIC_CONTENT[id] && getTopicProgress(progress, id).theoryDone);

  const mistakes = progress.mistakes || {};
  function accuracyOf(id) {
    const m = mistakes[id];
    if (!m || m.correct + m.wrong === 0) return null;
    return m.correct / (m.correct + m.wrong);
  }
  const weak = touchedIds.filter((id) => accuracyOf(id) !== null && accuracyOf(id) < 0.7);
  const unknown = touchedIds.filter((id) => accuracyOf(id) === null);
  const strong = touchedIds.filter((id) => accuracyOf(id) !== null && accuracyOf(id) >= 0.7);
  const ordered = [...shuffleArray(weak), ...shuffleArray(unknown), ...shuffleArray(strong)];

  const capped = ordered.slice(0, 10);
  const picked = capped.map((id) => {
    const pool = getEffectiveContent(id, overrides).typical || [];
    if (pool.length === 0) return null;
    const item = pool[Math.floor(Math.random() * pool.length)];
    return { topicId: id, prompt: item.prompt, answer: item.answer, explain: item.explain, graph: item.graph };
  }).filter(Boolean);
  return shuffleArray(picked);
}
