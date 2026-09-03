import { useState, useEffect, useCallback } from "react";
import { TOKENS, START_HEARTS } from "./theme.js";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import AuthScreen from "./AuthScreen.jsx";
import ResetPasswordScreen from "./ResetPasswordScreen.jsx";

import { TOPIC_CONTENT } from "./data/content.js";
import { runRobotProgram } from "./utils/robotInterpreter.js";
import { runPyProgram } from "./utils/pyInterpreter.js";
import { playCorrect, playWrong, playLevelUp } from "./utils/sound.js";
import { checkAnswer, shuffleQuestionOptions, shuffleArray } from "./utils/answers.js";
import {
  todayStr,
  yesterdayStr,
  defaultProgress,
  bumpMistakes,
  bumpMistakesFromAnswers,
  getTopicProgress,
  computeUnlockedAchievements,
} from "./utils/progress.js";
import {
  getEffectiveContent,
  buildExamSet,
  buildDailySet,
  getEffectiveRobotLevels,
  getEffectiveCodeLevels,
} from "./utils/contentHelpers.js";
import { computeAdminStats, computeUserDetail } from "./utils/adminStats.js";

import Confetti from "./components/Confetti.jsx";
import TopBar from "./components/TopBar.jsx";
import GlobalStyle from "./components/GlobalStyle.jsx";

import MapScreen from "./screens/MapScreen.jsx";
import TopicScreen from "./screens/TopicScreen.jsx";
import TypicalTasksScreen from "./screens/TypicalTasksScreen.jsx";
import TheoryScreen from "./screens/TheoryScreen.jsx";
import MCQScreen from "./screens/MCQScreen.jsx";
import PracticeScreen from "./screens/PracticeScreen.jsx";
import ExamScreen from "./screens/ExamScreen.jsx";
import ExamResultScreen from "./screens/ExamResultScreen.jsx";
import MarathonResultScreen from "./screens/MarathonResultScreen.jsx";
import DailyReviewScreen from "./screens/DailyReviewScreen.jsx";
import DailyReviewResultScreen from "./screens/DailyReviewResultScreen.jsx";
import NotesScreen from "./screens/NotesScreen.jsx";
import StatsScreen from "./screens/StatsScreen.jsx";
import RobotSimScreen from "./screens/RobotSimScreen.jsx";
import CodeLabScreen from "./screens/CodeLabScreen.jsx";
import AdminScreen from "./screens/AdminScreen.jsx";
import FailedScreen from "./screens/FailedScreen.jsx";
import StageResultScreen from "./screens/StageResultScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import AdminStatsScreen from "./screens/AdminStatsScreen.jsx";
import AdminUserScreen from "./screens/AdminUserScreen.jsx";

export default function OgeInformQuest() {
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [profile, setProfile] = useState(null);

  const [progress, setProgress] = useState(defaultProgress());
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState("map");
  const [currentTopicId, setCurrentTopicId] = useState(1);

  const [contentOverrides, setContentOverrides] = useState({});
  const [adminTopic, setAdminTopic] = useState(1);
  const [adminSection, setAdminSection] = useState("theory");
  const [adminStats, setAdminStats] = useState(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);
  const [adminStatsError, setAdminStatsError] = useState("");
  const [adminUserId, setAdminUserId] = useState(null);

  const [theoryIdx, setTheoryIdx] = useState(0);

  const [quizIdx, setQuizIdx] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizHearts, setQuizHearts] = useState(START_HEARTS);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);

  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceError, setPracticeError] = useState("");
  const [practiceHint, setPracticeHint] = useState(false);
  const [practiceRevealed, setPracticeRevealed] = useState(false);

  const [finalIdx, setFinalIdx] = useState(0);
  const [finalQuestions, setFinalQuestions] = useState([]);
  const [finalHearts, setFinalHearts] = useState(START_HEARTS);
  const [finalScore, setFinalScore] = useState(0);
  const [finalSelected, setFinalSelected] = useState(null);
  const [finalFeedback, setFinalFeedback] = useState(null);

  const [levelResult, setLevelResult] = useState(null);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [nameDraft, setNameDraft] = useState("");

  const [typicalTasks, setTypicalTasks] = useState([]);
  const [typicalIdx, setTypicalIdx] = useState(0);
  const [typicalInput, setTypicalInput] = useState("");
  const [typicalError, setTypicalError] = useState("");
  const [typicalChecked, setTypicalChecked] = useState(false);
  const [typicalCorrect, setTypicalCorrect] = useState(false);
  const [typicalScore, setTypicalScore] = useState(0);

  const [examQuestions, setExamQuestions] = useState([]);
  const [examIdx, setExamIdx] = useState(0);
  const [examInput, setExamInput] = useState("");
  const [examError, setExamError] = useState("");
  const [examChecked, setExamChecked] = useState(false);
  const [examCorrect, setExamCorrect] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [examAnswers, setExamAnswers] = useState([]);
  const [examSecondsLeft, setExamSecondsLeft] = useState(60 * 60);
  const [examResult, setExamResult] = useState(null);

  const [marathonActive, setMarathonActive] = useState(false);
  const [marathonRound, setMarathonRound] = useState(0);
  const [marathonResults, setMarathonResults] = useState([]);
  const [marathonResult, setMarathonResult] = useState(null);

  const [dailyQuestions, setDailyQuestions] = useState([]);
  const [dailyIdx, setDailyIdx] = useState(0);
  const [dailyInput, setDailyInput] = useState("");
  const [dailyError, setDailyError] = useState("");
  const [dailyChecked, setDailyChecked] = useState(false);
  const [dailyCorrect, setDailyCorrect] = useState(false);
  const [dailyAnswers, setDailyAnswers] = useState([]);
  const [dailyResult, setDailyResult] = useState(null);

  const [robotLevelIdx, setRobotLevelIdx] = useState(0);
  const [robotSource, setRobotSource] = useState("");
  const [robotRunResult, setRobotRunResult] = useState(null);
  const [robotError, setRobotError] = useState("");
  const [robotShowSolution, setRobotShowSolution] = useState(false);

  const [codeLevelIdx, setCodeLevelIdx] = useState(0);
  const [codeSource, setCodeSource] = useState("");
  const [codeExampleOutput, setCodeExampleOutput] = useState(null);
  const [codeExampleError, setCodeExampleError] = useState("");
  const [codeTestResults, setCodeTestResults] = useState(null);
  const [codeShowSolution, setCodeShowSolution] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      setSession(newSession);
      setAuthChecked(true);
      if (!newSession) setLoaded(false);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id || null;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    let mounted = true;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (mounted) setProfile(data || null);
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    (async () => {
      let p = defaultProgress();
      try {
        const { data: row } = await supabase.from("progress").select("data").eq("user_id", userId).single();
        if (row && row.data) {
          p = row.data;
        } else {
          // новый аккаунт без строки прогресса — стартуем с чистого листа,
          // а не из localStorage (тот общий на браузер и утекал между аккаунтами)
          await supabase.from("progress").upsert({ user_id: userId, data: p });
        }
      } catch (e) {
        // fall back to defaults
      }
      const today = todayStr();
      const yest = yesterdayStr();
      if (p.streak.lastDate !== today) {
        p.streak = {
          count: p.streak.lastDate === yest ? p.streak.count + 1 : 1,
          lastDate: today,
        };
      }
      let ov = {};
      try {
        const { data: ovRow } = await supabase.from("content_overrides").select("data").eq("id", 1).single();
        if (ovRow && ovRow.data) ov = ovRow.data;
      } catch (e) {
        // no overrides yet — using built-in content
      }
      if (mounted) {
        setProgress(p);
        setNameDraft(p.profile.name);
        setContentOverrides(ov);
        setLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const saveContentOverrides = useCallback(
    async (next) => {
      setContentOverrides(next);
      try {
        await supabase
          .from("content_overrides")
          .update({ data: next, updated_by: userId, updated_at: new Date().toISOString() })
          .eq("id", 1);
      } catch (e) {}
    },
    [userId]
  );

  function saveAdminSection(topicId, section, items) {
    const next = {
      ...contentOverrides,
      [topicId]: { ...(contentOverrides[topicId] || {}), [section]: items },
    };
    saveContentOverrides(next);
  }
  function resetAdminTopic(topicId) {
    const next = { ...contentOverrides };
    delete next[topicId];
    saveContentOverrides(next);
  }
  function importOverrides(parsed) {
    saveContentOverrides(parsed);
  }

  async function openAdminStats() {
    setScreen("adminStats");
    setAdminStatsLoading(true);
    setAdminStatsError("");
    try {
      const [{ data: progressRows, error: progressErr }, { data: profileRows, error: profileErr }] = await Promise.all([
        supabase.from("progress").select("user_id, data, updated_at"),
        supabase.from("profiles").select("id, email, name, role"),
      ]);
      if (progressErr) throw progressErr;
      if (profileErr) throw profileErr;
      setAdminStats(computeAdminStats(progressRows || [], profileRows || []));
    } catch (e) {
      setAdminStatsError(e.message || "Не удалось загрузить статистику");
    } finally {
      setAdminStatsLoading(false);
    }
  }

  function openAdminUser(targetUserId) {
    setAdminUserId(targetUserId);
    setScreen("adminUser");
  }

  async function toggleUserRole(targetUserId, nextRole) {
    const { error: err } = await supabase.from("profiles").update({ role: nextRole }).eq("id", targetUserId);
    if (err) throw err;
    setAdminStats((prev) =>
      prev ? { ...prev, users: prev.users.map((u) => (u.id === targetUserId ? { ...u, role: nextRole } : u)) } : prev
    );
  }

  const saveProgress = useCallback(
    async (next) => {
      setProgress(next);
      if (userId) {
        try {
          await supabase.from("progress").upsert({ user_id: userId, data: next, updated_at: new Date().toISOString() });
        } catch (e) {}
      }
    },
    [userId]
  );

  function applyProgressUpdate(mutator) {
    const next = mutator(progress);
    const before = new Set(progress.achievements);
    const unlockedNow = computeUnlockedAchievements(next, contentOverrides);
    const newly = unlockedNow.filter((id) => !before.has(id));
    next.achievements = unlockedNow;
    saveProgress(next);
    return newly;
  }

  const soundOn = progress.settings?.soundOn !== false;
  const content = getEffectiveContent(currentTopicId, contentOverrides);
  const topicProg = getTopicProgress(progress, currentTopicId);
  const robotLevels = getEffectiveRobotLevels(contentOverrides);
  const codeLevels = getEffectiveCodeLevels(contentOverrides);

  function openTopic(id) {
    setCurrentTopicId(id);
    setScreen("topic");
  }

  function startTheory() {
    setTheoryIdx(0);
    setScreen("theory");
  }
  function finishTheory() {
    applyProgressUpdate((p) => ({
      ...p,
      topics: { ...p.topics, [currentTopicId]: { ...getTopicProgress(p, currentTopicId), theoryDone: true } },
    }));
    setScreen("topic");
  }

  function startQuiz() {
    setQuizQuestions(shuffleArray(content.quiz).map(shuffleQuestionOptions));
    setQuizIdx(0);
    setQuizHearts(START_HEARTS);
    setQuizScore(0);
    setQuizSelected(null);
    setQuizFeedback(null);
    setScreen("quiz");
  }
  function answerQuiz(i) {
    if (quizSelected !== null) return;
    setQuizSelected(i);
    const q = quizQuestions[quizIdx];
    const isCorrect = i === q.correct;
    setQuizFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      playCorrect(soundOn);
      setConfettiBurst((n) => n + 1);
      setQuizScore((s) => s + 1);
    } else {
      playWrong(soundOn);
      setQuizHearts((h) => h - 1);
    }
  }
  function nextQuiz() {
    if (quizFeedback === "wrong" && quizHearts - 1 <= 0) {
      setScreen("quizFailed");
      return;
    }
    if (quizIdx + 1 >= quizQuestions.length) {
      const earnedXp = quizScore * 10;
      const wrongCount = quizQuestions.length - quizScore;
      const newly = applyProgressUpdate((p) => ({
        ...p,
        xp: p.xp + earnedXp,
        topics: {
          ...p.topics,
          [currentTopicId]: {
            ...getTopicProgress(p, currentTopicId),
            quizBest: Math.max(getTopicProgress(p, currentTopicId).quizBest, quizScore),
          },
        },
        mistakes: bumpMistakes(p.mistakes, currentTopicId, quizScore, wrongCount),
      }));
      playLevelUp(soundOn);
      setConfettiBurst((n) => n + 1);
      setLevelResult({ kind: "quiz", score: quizScore, total: quizQuestions.length, xp: earnedXp, newly });
      setScreen("stageResult");
      return;
    }
    setQuizIdx((i) => i + 1);
    setQuizSelected(null);
    setQuizFeedback(null);
  }

  function startPractice() {
    setPracticeIdx(0);
    setPracticeInput("");
    setPracticeError("");
    setPracticeHint(false);
    setPracticeRevealed(false);
    setScreen("practice");
  }
  function checkPractice() {
    const step = content.practice[practiceIdx];
    if (!practiceInput.trim()) {
      setPracticeError("Сначала введи ответ");
      return;
    }
    setPracticeError("");
    setPracticeRevealed(true);
    const isRight = practiceInput.trim() === step.answer;
    if (isRight) playCorrect(soundOn);
    else playWrong(soundOn);
  }
  function nextPractice() {
    if (practiceIdx + 1 >= content.practice.length) {
      const newly = applyProgressUpdate((p) => ({
        ...p,
        xp: p.xp + 15,
        topics: { ...p.topics, [currentTopicId]: { ...getTopicProgress(p, currentTopicId), practiceDone: true } },
      }));
      playLevelUp(soundOn);
      setLevelResult({ kind: "practice", xp: 15, newly });
      setScreen("stageResult");
      return;
    }
    setPracticeIdx((i) => i + 1);
    setPracticeInput("");
    setPracticeError("");
    setPracticeHint(false);
    setPracticeRevealed(false);
  }

  function startTypical() {
    setTypicalTasks(shuffleArray(content.typical || []));
    setTypicalIdx(0);
    setTypicalInput("");
    setTypicalError("");
    setTypicalChecked(false);
    setTypicalCorrect(false);
    setTypicalScore(0);
    setScreen("typical");
  }
  function checkTypical() {
    const list = typicalTasks;
    const item = list[typicalIdx];
    if (!typicalInput.trim()) {
      setTypicalError("Сначала введи ответ");
      return;
    }
    setTypicalError("");
    const ok = checkAnswer(typicalInput, item.answer);
    setTypicalChecked(true);
    setTypicalCorrect(ok);
    if (ok) {
      playCorrect(soundOn);
      setConfettiBurst((n) => n + 1);
      setTypicalScore((s) => s + 1);
    } else {
      playWrong(soundOn);
    }
  }
  function nextTypical() {
    const list = typicalTasks;
    if (typicalIdx + 1 >= list.length) {
      const earnedXp = typicalScore * 5;
      const wrongCount = list.length - typicalScore;
      const newly = applyProgressUpdate((p) => ({
        ...p,
        xp: p.xp + earnedXp,
        mistakes: bumpMistakes(p.mistakes, currentTopicId, typicalScore, wrongCount),
      }));
      playLevelUp(soundOn);
      setLevelResult({ kind: "typical", score: typicalScore, total: list.length, xp: earnedXp, newly });
      setScreen("stageResult");
      return;
    }
    setTypicalIdx((i) => i + 1);
    setTypicalInput("");
    setTypicalError("");
    setTypicalChecked(false);
    setTypicalCorrect(false);
  }

  function openRobotSim() {
    setRobotLevelIdx(0);
    setRobotSource(robotLevels[0].starter);
    setRobotRunResult(null);
    setRobotError("");
    setRobotShowSolution(false);
    setScreen("robotSim");
  }
  function pickRobotLevel(idx) {
    setRobotLevelIdx(idx);
    setRobotSource(robotLevels[idx].starter);
    setRobotRunResult(null);
    setRobotError("");
    setRobotShowSolution(false);
  }
  function runRobot() {
    const level = robotLevels[robotLevelIdx];
    let result;
    try {
      result = runRobotProgram(level, robotSource);
    } catch (e) {
      setRobotRunResult(null);
      setRobotError(e.message || "Ошибка выполнения");
      return;
    }
    setRobotError("");
    setRobotRunResult(result);
    if (result.matches) {
      playLevelUp(soundOn);
      setConfettiBurst((n) => n + 1);
      applyProgressUpdate((p) => {
        const solved = p.robotLevelsSolved || [];
        if (solved.includes(level.id)) return p;
        return { ...p, xp: p.xp + 20, robotLevelsSolved: [...solved, level.id] };
      });
    } else {
      playWrong(soundOn);
    }
  }

  function openCodeLab() {
    setCodeLevelIdx(0);
    setCodeSource(codeLevels[0].starter);
    setCodeExampleOutput(null);
    setCodeExampleError("");
    setCodeTestResults(null);
    setCodeShowSolution(false);
    setScreen("codeLab");
  }
  function pickCodeLevel(idx) {
    setCodeLevelIdx(idx);
    setCodeSource(codeLevels[idx].starter);
    setCodeExampleOutput(null);
    setCodeExampleError("");
    setCodeTestResults(null);
    setCodeShowSolution(false);
  }
  function runCodeExample() {
    const level = codeLevels[codeLevelIdx];
    setCodeTestResults(null);
    try {
      const out = runPyProgram(codeSource, level.example.input);
      setCodeExampleOutput(out);
      setCodeExampleError("");
    } catch (e) {
      setCodeExampleOutput(null);
      setCodeExampleError(e.message || "Ошибка выполнения");
    }
  }
  function checkCodeSolution() {
    const level = codeLevels[codeLevelIdx];
    const allCases = [level.example, ...level.hidden];
    const results = allCases.map((tc, i) => {
      try {
        const out = runPyProgram(codeSource, tc.input);
        const expected = tc.output.map(String);
        const pass = JSON.stringify(out) === JSON.stringify(expected);
        return { i, pass, got: out, expected, error: null, isExample: i === 0 };
      } catch (e) {
        return { i, pass: false, got: null, expected: tc.output.map(String), error: e.message, isExample: i === 0 };
      }
    });
    const allPass = results.every((r) => r.pass);
    setCodeTestResults(results);
    if (allPass) {
      playLevelUp(soundOn);
      setConfettiBurst((n) => n + 1);
      applyProgressUpdate((p) => {
        const solved = p.codeLevelsSolved || [];
        if (solved.includes(level.id)) return p;
        return { ...p, xp: p.xp + 25, codeLevelsSolved: [...solved, level.id] };
      });
    } else {
      playWrong(soundOn);
    }
  }

  function beginExamRound() {
    const qs = buildExamSet(contentOverrides);
    setExamQuestions(qs);
    setExamIdx(0);
    setExamInput("");
    setExamError("");
    setExamChecked(false);
    setExamCorrect(false);
    setExamScore(0);
    setExamAnswers([]);
    setExamSecondsLeft(60 * 60);
    setExamResult(null);
    setScreen("exam");
  }
  function startExam() {
    setMarathonActive(false);
    setMarathonRound(0);
    setMarathonResults([]);
    setMarathonResult(null);
    beginExamRound();
  }
  function startMarathon() {
    setMarathonActive(true);
    setMarathonRound(1);
    setMarathonResults([]);
    setMarathonResult(null);
    beginExamRound();
  }
  function finishExam(finalAnswers, finalScore) {
    const total = examQuestions.length;
    const percent = total > 0 ? Math.round((finalScore / total) * 100) : 0;
    // Шкала пропорционально масштабирована от официальных границ ОГЭ по информатике
    // (5: 17-19, 4: 11-16, 3: 5-10 из 19 первичных баллов за всю работу).
    // В нашем экзамене 15 заданий — по одному на каждую тему кодификатора,
    // условно с равным весом (в реальном экзамене задания 13-15 "стоят" дороже).
    const grade = finalScore >= 13 ? 5 : finalScore >= 9 ? 4 : finalScore >= 4 ? 3 : 2;
    const earnedXp = finalScore * 8;
    const record = { score: finalScore, total, date: todayStr() };
    const newly = applyProgressUpdate((p) => ({
      ...p,
      xp: p.xp + earnedXp,
      examBest: !p.examBest || finalScore > p.examBest.score ? record : p.examBest,
      mistakes: bumpMistakesFromAnswers(p.mistakes, finalAnswers),
    }));
    playLevelUp(soundOn);

    if (marathonActive) {
      const updatedResults = [...marathonResults, { round: marathonRound, score: finalScore, total, grade }];
      setMarathonResults(updatedResults);
      if (marathonRound < 3) {
        setMarathonRound((r) => r + 1);
        beginExamRound();
        return;
      }
      setMarathonActive(false);
      const totalScore = updatedResults.reduce((s, r) => s + r.score, 0);
      const totalMax = updatedResults.reduce((s, r) => s + r.total, 0);
      const avgGrade = updatedResults.reduce((s, r) => s + r.grade, 0) / updatedResults.length;
      const marathonXp = 30;
      applyProgressUpdate((p) => ({
        ...p,
        xp: p.xp + marathonXp,
        marathonBest: !p.marathonBest || totalScore > p.marathonBest.totalScore ? { totalScore, totalMax, date: todayStr() } : p.marathonBest,
      }));
      setMarathonResult({ rounds: updatedResults, totalScore, totalMax, avgGrade, xp: marathonXp });
      setScreen("marathonResult");
      return;
    }

    setExamResult({ score: finalScore, total, percent, grade, xp: earnedXp, newly, answers: finalAnswers });
    setScreen("examResult");
  }
  function checkExam() {
    const item = examQuestions[examIdx];
    if (!examInput.trim()) {
      setExamError("Сначала введи ответ");
      return;
    }
    setExamError("");
    const ok = checkAnswer(examInput, item.answer);
    setExamChecked(true);
    setExamCorrect(ok);
    if (ok) {
      playCorrect(soundOn);
      setConfettiBurst((n) => n + 1);
      setExamScore((s) => s + 1);
    } else {
      playWrong(soundOn);
    }
  }
  function nextExam(skip) {
    const item = examQuestions[examIdx];
    const wasCorrect = !skip && examCorrect;
    const updatedAnswers = [...examAnswers, { topicId: item.topicId, prompt: item.prompt, given: skip ? "" : examInput, answer: item.answer, correct: wasCorrect }];
    const scoreSoFar = updatedAnswers.filter((a) => a.correct).length;
    if (examIdx + 1 >= examQuestions.length) {
      setExamAnswers(updatedAnswers);
      finishExam(updatedAnswers, scoreSoFar);
      return;
    }
    setExamAnswers(updatedAnswers);
    setExamIdx((i) => i + 1);
    setExamInput("");
    setExamError("");
    setExamChecked(false);
    setExamCorrect(false);
  }

  useEffect(() => {
    if (screen !== "exam") return;
    if (examSecondsLeft <= 0) {
      const scoreSoFar = examAnswers.filter((a) => a.correct).length;
      finishExam(examAnswers, scoreSoFar);
      return;
    }
    const t = setTimeout(() => setExamSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, examSecondsLeft]);

  const dailyDone = progress.dailyReview?.lastDate === todayStr();
  const dailyEligibleCount = Object.keys(progress.topics || {}).filter(
    (id) => TOPIC_CONTENT[Number(id)] && getTopicProgress(progress, Number(id)).theoryDone
  ).length;

  function startDailyReview() {
    const qs = buildDailySet(progress, contentOverrides);
    setDailyQuestions(qs);
    setDailyIdx(0);
    setDailyInput("");
    setDailyError("");
    setDailyChecked(false);
    setDailyCorrect(false);
    setDailyAnswers([]);
    setDailyResult(null);
    setScreen("dailyReview");
  }
  function checkDaily() {
    const item = dailyQuestions[dailyIdx];
    if (!dailyInput.trim()) {
      setDailyError("Сначала введи ответ");
      return;
    }
    setDailyError("");
    const ok = checkAnswer(dailyInput, item.answer);
    setDailyChecked(true);
    setDailyCorrect(ok);
    if (ok) {
      playCorrect(soundOn);
      setConfettiBurst((n) => n + 1);
    } else {
      playWrong(soundOn);
    }
  }
  function finishDaily(answers) {
    const total = dailyQuestions.length;
    const score = answers.filter((a) => a.correct).length;
    const today = todayStr();
    const yest = yesterdayStr();
    const earnedXp = score * 4;
    const newly = applyProgressUpdate((p) => {
      const dr = p.dailyReview || { lastDate: null, streakDays: 0, history: [] };
      const streakDays = dr.lastDate === yest ? dr.streakDays + 1 : 1;
      const history = [...(dr.history || []), { date: today, score, total }].slice(-30);
      return {
        ...p,
        xp: p.xp + earnedXp,
        dailyReview: { lastDate: today, streakDays, history },
        mistakes: bumpMistakesFromAnswers(p.mistakes, answers),
      };
    });
    playLevelUp(soundOn);
    setDailyResult({ score, total, xp: earnedXp, newly });
    setScreen("dailyReviewResult");
  }
  function nextDaily(skip) {
    const item = dailyQuestions[dailyIdx];
    const wasCorrect = !skip && dailyCorrect;
    const updatedAnswers = [...dailyAnswers, { topicId: item.topicId, correct: wasCorrect }];
    if (dailyIdx + 1 >= dailyQuestions.length) {
      setDailyAnswers(updatedAnswers);
      finishDaily(updatedAnswers);
      return;
    }
    setDailyAnswers(updatedAnswers);
    setDailyIdx((i) => i + 1);
    setDailyInput("");
    setDailyError("");
    setDailyChecked(false);
    setDailyCorrect(false);
  }

  function startFinal() {
    setFinalQuestions(shuffleArray(content.final).map(shuffleQuestionOptions));
    setFinalIdx(0);
    setFinalHearts(START_HEARTS);
    setFinalScore(0);
    setFinalSelected(null);
    setFinalFeedback(null);
    setScreen("final");
  }
  function answerFinal(i) {
    if (finalSelected !== null) return;
    setFinalSelected(i);
    const q = finalQuestions[finalIdx];
    const isCorrect = i === q.correct;
    setFinalFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      playCorrect(soundOn);
      setConfettiBurst((n) => n + 1);
      setFinalScore((s) => s + 1);
    } else {
      playWrong(soundOn);
      setFinalHearts((h) => h - 1);
    }
  }
  function nextFinal() {
    if (finalFeedback === "wrong" && finalHearts - 1 <= 0) {
      setScreen("finalFailed");
      return;
    }
    if (finalIdx + 1 >= finalQuestions.length) {
      const stars = finalScore >= 5 ? 3 : finalScore >= 4 ? 2 : finalScore >= 3 ? 1 : 0;
      const earnedXp = finalScore * 15;
      const wrongCount = finalQuestions.length - finalScore;
      const newly = applyProgressUpdate((p) => {
        const tp = getTopicProgress(p, currentTopicId);
        return {
          ...p,
          xp: p.xp + earnedXp,
          topics: {
            ...p.topics,
            [currentTopicId]: {
              ...tp,
              finalBest: Math.max(tp.finalBest, finalScore),
              stars: Math.max(tp.stars, stars),
            },
          },
          mistakes: bumpMistakes(p.mistakes, currentTopicId, finalScore, wrongCount),
        };
      });
      playLevelUp(soundOn);
      setConfettiBurst((n) => n + 1);
      setLevelResult({ kind: "final", score: finalScore, total: finalQuestions.length, stars, xp: earnedXp, newly });
      setScreen("stageResult");
      return;
    }
    setFinalIdx((i) => i + 1);
    setFinalSelected(null);
    setFinalFeedback(null);
  }

  function toggleSound() {
    saveProgress({ ...progress, settings: { ...progress.settings, soundOn: !soundOn } });
  }
  function saveName() {
    const clean = nameDraft.trim() || "Игрок";
    saveProgress({ ...progress, profile: { ...progress.profile, name: clean } });
  }
  function pickAvatar(id) {
    saveProgress({ ...progress, profile: { ...progress.profile, avatar: id } });
  }
  function addNote(title, text) {
    if (!text.trim()) return;
    const note = { id: Date.now(), title: title.trim() || "Без названия", text: text.trim() };
    saveProgress({ ...progress, notes: [note, ...(progress.notes || [])] });
  }
  function deleteNote(id) {
    saveProgress({ ...progress, notes: (progress.notes || []).filter((n) => n.id !== id) });
  }
  function resetProgress() {
    const fresh = defaultProgress();
    fresh.streak = progress.streak;
    setNameDraft(fresh.profile.name);
    saveProgress(fresh);
    setScreen("map");
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="quest-app-shell" style={styles.appShell}>
        <div style={{ ...styles.center, minHeight: 400, padding: "40px 20px", textAlign: "center" }}>
          <h3 className="quest-heading" style={{ fontSize: 18, margin: "0 0 10px" }}>
            Supabase не настроен
          </h3>
          <p style={{ color: TOKENS.textMuted, fontSize: 13, maxWidth: 320 }}>
            Не заданы VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY. Заполни их в файле .env (см. .env.example) локально,
            а на хостинге — в настройках переменных окружения проекта, и пересобери приложение.
          </p>
        </div>
        <GlobalStyle />
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="quest-app-shell" style={styles.appShell}>
        <div style={{ ...styles.center, minHeight: 400 }}>
          <p style={{ color: TOKENS.textMuted }}>Проверяю сессию…</p>
        </div>
        <GlobalStyle />
      </div>
    );
  }

  if (passwordRecovery) {
    return (
      <div className="quest-app-shell" style={styles.appShell}>
        <ResetPasswordScreen onDone={() => setPasswordRecovery(false)} />
        <GlobalStyle />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="quest-app-shell" style={styles.appShell}>
        <AuthScreen />
        <GlobalStyle />
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="quest-app-shell" style={styles.appShell}>
        <div style={{ ...styles.center, minHeight: 400 }}>
          <p style={{ color: TOKENS.textMuted }}>Загружаю прогресс…</p>
        </div>
        <GlobalStyle />
      </div>
    );
  }

  return (
    <div className="quest-app-shell" style={styles.appShell}>
      <Confetti trigger={confettiBurst} />
      <TopBar
        xp={progress.xp}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onProfile={() => setScreen("profile")}
      />

      {screen === "map" && <MapScreen progress={progress} onEnter={openTopic} onExam={startExam} onMarathon={startMarathon} onStart={startDailyReview} onNotes={() => setScreen("notes")} />}

      {screen === "topic" && (
        <TopicScreen
          topicId={currentTopicId}
          topicProg={topicProg}
          content={content}
          onBack={() => setScreen("map")}
          onTheory={startTheory}
          onQuiz={startQuiz}
          onPractice={startPractice}
          onFinal={startFinal}
          onTypical={startTypical}
          onRobotSim={currentTopicId === 15 ? openRobotSim : undefined}
          onCodeLab={currentTopicId === 16 ? openCodeLab : undefined}
        />
      )}

      {screen === "codeLab" && (
        <CodeLabScreen
          levels={codeLevels}
          levelIdx={codeLevelIdx}
          onPickLevel={pickCodeLevel}
          source={codeSource}
          setSource={setCodeSource}
          exampleOutput={codeExampleOutput}
          exampleError={codeExampleError}
          testResults={codeTestResults}
          showSolution={codeShowSolution}
          setShowSolution={setCodeShowSolution}
          onRunExample={runCodeExample}
          onCheck={checkCodeSolution}
          solvedLevels={progress.codeLevelsSolved || []}
          onExit={() => setScreen("topic")}
        />
      )}

      {screen === "typical" && (
        <TypicalTasksScreen
          tasks={typicalTasks}
          idx={typicalIdx}
          input={typicalInput}
          setInput={setTypicalInput}
          error={typicalError}
          checked={typicalChecked}
          correct={typicalCorrect}
          onCheck={checkTypical}
          onNext={nextTypical}
          onExit={() => setScreen("topic")}
        />
      )}

      {screen === "robotSim" && (
        <RobotSimScreen
          levels={robotLevels}
          levelIdx={robotLevelIdx}
          onPickLevel={pickRobotLevel}
          source={robotSource}
          setSource={setRobotSource}
          runResult={robotRunResult}
          error={robotError}
          showSolution={robotShowSolution}
          setShowSolution={setRobotShowSolution}
          onRun={runRobot}
          solvedLevels={progress.robotLevelsSolved || []}
          onExit={() => setScreen("topic")}
        />
      )}

      {screen === "exam" && (
        <ExamScreen
          questions={examQuestions}
          idx={examIdx}
          secondsLeft={examSecondsLeft}
          input={examInput}
          setInput={setExamInput}
          error={examError}
          checked={examChecked}
          correct={examCorrect}
          onCheck={checkExam}
          onNext={() => nextExam(false)}
          onSkip={() => nextExam(true)}
          onExit={() => setScreen("map")}
        />
      )}

      {screen === "examResult" && (
        <ExamResultScreen result={examResult} onContinue={() => setScreen("map")} onRetry={startExam} />
      )}

      {screen === "marathonResult" && (
        <MarathonResultScreen result={marathonResult} onContinue={() => setScreen("map")} onRetry={startMarathon} />
      )}

      {screen === "dailyReview" && (
        <DailyReviewScreen
          questions={dailyQuestions}
          idx={dailyIdx}
          input={dailyInput}
          setInput={setDailyInput}
          error={dailyError}
          checked={dailyChecked}
          correct={dailyCorrect}
          onCheck={checkDaily}
          onNext={() => nextDaily(false)}
          onSkip={() => nextDaily(true)}
          onExit={() => setScreen("map")}
        />
      )}

      {screen === "dailyReviewResult" && (
        <DailyReviewResultScreen result={dailyResult} streakDays={progress.dailyReview?.streakDays || 0} onContinue={() => setScreen("map")} />
      )}

      {screen === "stats" && (
        <StatsScreen mistakes={progress.mistakes || {}} onBack={() => setScreen("profile")} />
      )}

      {screen === "notes" && (
        <NotesScreen notes={progress.notes || []} onAdd={addNote} onDelete={deleteNote} onBack={() => setScreen("map")} />
      )}

      {screen === "theory" && (
        <TheoryScreen
          cards={content.theory}
          idx={theoryIdx}
          setIdx={setTheoryIdx}
          onDone={finishTheory}
          onExit={() => setScreen("topic")}
        />
      )}

      {screen === "quiz" && (
        <MCQScreen
          mode="quiz"
          questions={quizQuestions}
          idx={quizIdx}
          hearts={quizHearts}
          selected={quizSelected}
          feedback={quizFeedback}
          onAnswer={answerQuiz}
          onNext={nextQuiz}
          onExit={() => setScreen("topic")}
        />
      )}
      {screen === "quizFailed" && (
        <FailedScreen label="Жизни закончились в квизе" onRetry={startQuiz} onExit={() => setScreen("topic")} />
      )}

      {screen === "practice" && (
        <PracticeScreen
          steps={content.practice}
          idx={practiceIdx}
          input={practiceInput}
          setInput={setPracticeInput}
          error={practiceError}
          hint={practiceHint}
          setHint={setPracticeHint}
          revealed={practiceRevealed}
          onCheck={checkPractice}
          onNext={nextPractice}
          onExit={() => setScreen("topic")}
        />
      )}

      {screen === "final" && (
        <MCQScreen
          mode="final"
          questions={finalQuestions}
          idx={finalIdx}
          hearts={finalHearts}
          selected={finalSelected}
          feedback={finalFeedback}
          onAnswer={answerFinal}
          onNext={nextFinal}
          onExit={() => setScreen("topic")}
        />
      )}
      {screen === "finalFailed" && (
        <FailedScreen label="Жизни закончились в итоговой проверке" onRetry={startFinal} onExit={() => setScreen("topic")} />
      )}

      {screen === "stageResult" && (
        <StageResultScreen result={levelResult} onContinue={() => setScreen("topic")} />
      )}

      {screen === "profile" && (
        <ProfileScreen
          progress={progress}
          nameDraft={nameDraft}
          setNameDraft={setNameDraft}
          onSaveName={saveName}
          onPickAvatar={pickAvatar}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onReset={resetProgress}
          onBack={() => setScreen("map")}
          email={session.user.email}
          isAdmin={profile?.role === "admin"}
          onOpenAdmin={() => setScreen("admin")}
          onOpenAdminStats={openAdminStats}
          onLogout={() => supabase.auth.signOut()}
          onOpenStats={() => setScreen("stats")}
        />
      )}

      {screen === "admin" && profile?.role === "admin" && (
        <AdminScreen
          overrides={contentOverrides}
          selectedTopic={adminTopic}
          setSelectedTopic={setAdminTopic}
          selectedSection={adminSection}
          setSelectedSection={setAdminSection}
          onSaveSection={saveAdminSection}
          onResetTopic={resetAdminTopic}
          onImportOverrides={importOverrides}
          onExit={() => setScreen("profile")}
        />
      )}

      {screen === "adminStats" && profile?.role === "admin" && (
        <AdminStatsScreen
          loading={adminStatsLoading}
          error={adminStatsError}
          stats={adminStats}
          currentUserId={userId}
          onToggleRole={toggleUserRole}
          onOpenUser={openAdminUser}
          onBack={() => setScreen("profile")}
        />
      )}

      {screen === "adminUser" && profile?.role === "admin" && (() => {
        const target = adminStats?.users.find((u) => u.id === adminUserId);
        if (!target) return null;
        return (
          <AdminUserScreen
            user={target}
            detail={computeUserDetail(target.data)}
            onBack={() => setScreen("adminStats")}
          />
        );
      })()}

      <GlobalStyle />
    </div>
  );
}

const styles = {
  appShell: {
    fontFamily: "'Manrope', sans-serif",
    background: `linear-gradient(180deg, ${TOKENS.bg} 0%, ${TOKENS.bg2} 100%)`,
    color: TOKENS.text,
    minHeight: "100vh",
    width: "100%",
    padding: "0 0 24px",
    position: "relative",
    boxSizing: "border-box",
  },
  center: { display: "flex", alignItems: "center", justifyContent: "center" },
};
