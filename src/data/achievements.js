// Достижения профиля: у каждого есть check(progress, overrides) -> boolean.
import { BookOpen, Sparkles, Trophy, Award, Flame, Clock, RotateCcw, Brain, BarChart3 } from "lucide-react";
import { TOPIC_CONTENT } from "./content.js";
import { getEffectiveContent, getEffectiveRobotLevels, getEffectiveCodeLevels } from "../utils/contentHelpers.js";

export const ACHIEVEMENTS = [
  {
    id: "first_theory",
    icon: BookOpen,
    title: "Первые шаги",
    desc: "Пройди теорию любой темы",
    check: (p) => Object.values(p.topics || {}).some((t) => t.theoryDone),
  },
  {
    id: "no_mistakes",
    icon: Sparkles,
    title: "Без ошибок",
    desc: "Пройди квиз на максимум",
    check: (p, overrides) =>
      Object.entries(p.topics || {}).some(([id, t]) => {
        const idNum = Number(id);
        if (!TOPIC_CONTENT[idNum]) return false;
        const eff = getEffectiveContent(idNum, overrides);
        return t.quizBest === eff.quiz.length;
      }),
  },
  {
    id: "topic_master",
    icon: Trophy,
    title: "Мастер темы",
    desc: "Получи 3 звезды за тему",
    check: (p) => Object.values(p.topics || {}).some((t) => t.stars === 3),
  },
  {
    id: "three_topics",
    icon: Award,
    title: "Три темы позади",
    desc: "Открой звёзды в трёх темах",
    check: (p) => Object.values(p.topics || {}).filter((t) => t.stars > 0).length >= 3,
  },
  {
    id: "streak3",
    icon: Flame,
    title: "Серия из трёх",
    desc: "Занимайся 3 дня подряд",
    check: (p) => (p.streak?.count || 0) >= 3,
  },
  {
    id: "exam_done",
    icon: Clock,
    title: "Экзамен сдан",
    desc: "Пройди пробный экзамен хотя бы на половину баллов",
    check: (p) => p.examBest && p.examBest.total > 0 && p.examBest.score / p.examBest.total >= 0.5,
  },
  {
    id: "daily_streak3",
    icon: RotateCcw,
    title: "Держу форму",
    desc: "Пройди «Восстановление знаний» 3 дня подряд",
    check: (p) => (p.dailyReview?.streakDays || 0) >= 3,
  },
  {
    id: "robot_master",
    icon: Brain,
    title: "Повелитель Робота",
    desc: "Реши все уровни симулятора программирования Робота",
    check: (p, overrides) => (p.robotLevelsSolved || []).length >= getEffectiveRobotLevels(overrides).length,
  },
  {
    id: "code_master",
    icon: BarChart3,
    title: "Настоящий программист",
    desc: "Реши все уровни в теме «Программирование»",
    check: (p, overrides) => (p.codeLevelsSolved || []).length >= getEffectiveCodeLevels(overrides).length,
  },
];
