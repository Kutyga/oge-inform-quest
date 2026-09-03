import { BookOpen, Brain, Gamepad2, ListChecks, Target, Trophy, Zap } from "lucide-react";
import { TOKENS } from "../theme.js";
import { TOPIC_META } from "../data/topics.js";
import BackRow from "../components/BackRow.jsx";
import StageRow from "../components/StageRow.jsx";

export default function TopicScreen({ topicId, topicProg, content, onBack, onTheory, onQuiz, onPractice, onFinal, onTypical, onRobotSim, onCodeLab }) {
  const meta = TOPIC_META[topicId];
  return (
    <div style={{ padding: "8px 20px 0" }}>
      <BackRow onBack={onBack} label="Карта тем" />
      <h2 className="quest-heading" style={{ fontSize: 22, margin: "12px 0 4px" }}>
        {topicId}. {meta.title}
      </h2>
      <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: "0 0 20px" }}>
        Пройди четыре этапа по порядку — от теории к настоящей проверке. Задачник — отдельно, в любое время.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <StageRow icon={BookOpen} label="Теория" sub={`${content.theory.length} карточек — читаем и запоминаем`} done={topicProg.theoryDone} onClick={onTheory} />
        <StageRow
          icon={Brain}
          label="Квиз"
          sub={topicProg.quizBest ? `Лучший результат: ${topicProg.quizBest}/${content.quiz.length}` : `${content.quiz.length} вопросов на понимание`}
          done={topicProg.quizBest === content.quiz.length}
          onClick={onQuiz}
        />
        <StageRow icon={Target} label="Мини-практика" sub={`Реши ${content.practice.length} задачи сам, с подсказками`} done={topicProg.practiceDone} onClick={onPractice} />
        <StageRow
          icon={Trophy}
          label="Итоговая проверка"
          sub={topicProg.stars ? `Получено звёзд: ${topicProg.stars}/3` : `${content.final.length} заданий в стиле экзамена`}
          done={topicProg.stars > 0}
          onClick={onFinal}
        />
        <StageRow icon={ListChecks} label="Типовые задания" sub={`${(content.typical || []).length} задач — как в реальном варианте`} done={false} onClick={onTypical} />
        {onRobotSim && (
          <StageRow icon={Gamepad2} label="Симулятор Робота" sub="Пиши программу и проверяй её на поле" done={false} onClick={onRobotSim} />
        )}
        {onCodeLab && (
          <StageRow icon={Zap} label="Написать код" sub="Пиши Python — код правда выполняется и проверяется" done={false} onClick={onCodeLab} />
        )}
      </div>
    </div>
  );
}
