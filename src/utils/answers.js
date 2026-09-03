// Сверка ответов пользователя и перемешивание вариантов/массивов.

export function normalizeAnswer(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]/g, "");
}
export function checkAnswer(input, answer) {
  return normalizeAnswer(input) === normalizeAnswer(answer);
}
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function shuffleQuestionOptions(q) {
  const idxs = shuffleArray(q.options.map((_, i) => i));
  const newOptions = idxs.map((i) => q.options[i]);
  const newCorrect = idxs.indexOf(q.correct);
  return { ...q, options: newOptions, correct: newCorrect };
}
