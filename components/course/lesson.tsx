"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  RotateCcw,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { title, type Lesson, type Block } from "@/lib/course"
import { normalize } from "@/lib/progress"
import { useProgress } from "./progress-provider"
export function LessonPage({ lesson }: { lesson: Lesson }) {
  const { progress, ready, visit, reset } = useProgress()
  const [filter, setFilter] = useState("all")
  const [generation, setGeneration] = useState(0)
  useEffect(() => {
    if (ready && lesson.status === "available") visit(lesson.id)
  }, [ready, lesson.id, lesson.status, visit])
  const exercises = lesson.blocks.filter((b) => b.kind === "exercise")
  const done = exercises.filter(
    (b) => progress.entries[b.id]?.mark === "done"
  ).length
  const count = exercises.filter((b) =>
    progress.entries[b.id]?.text.trim()
  ).length
  const visible = (b: Block) =>
    filter === "all" ||
    (filter === "repeat" && progress.entries[b.id]?.mark === "repeat") ||
    (filter === "unanswered" && !progress.entries[b.id]?.text.trim())
  return (
    <>
      <Link href="/" className="back-link">
        <ArrowLeft size={16} /> Все домашние задания
      </Link>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            ПРАКТИКА / {String(lesson.id).padStart(2, "0")}
          </div>
          <h1>
            Домашняя работа {lesson.id}
            <span>.</span>
          </h1>
          <p>{title(lesson.id)}</p>
        </div>
        <Link className="soft-link" href={`/answers#homework-${lesson.id}`}>
          <BookOpen size={16} /> К ответам
        </Link>
      </div>
      {lesson.status !== "available" ? (
        <section className="empty-state">
          <span className="empty-icon">
            <BookOpen />
          </span>
          <h2>Материал ещё не добавлен</h2>
          <p>
            {lesson.status === "empty"
              ? "В исходной таблице эта работа пустая."
              : "В исходной таблице здесь повторяются тестовые фразы вместо учебных заданий."}
            <br />
            Раздел сохранён, чтобы позже добавить материалы преподавателя.
          </p>
          <Link className="primary-link" href="/">
            Выбрать другую работу <ArrowRight size={16} />
          </Link>
        </section>
      ) : (
        <>
          <div className="lesson-progress">
            <div>
              <strong>
                {done} / {exercises.length}
              </strong>
              <span>разобрано</span>
            </div>
            <div className="progress-track">
              <i style={{ width: `${(done / exercises.length) * 100}%` }} />
            </div>
            <span>{count} заполнено</span>
          </div>
          <div className="lesson-toolbar">
            <div className="tabs">
              {[
                ["all", "Все задания"],
                ["unanswered", "Без ответа"],
                ["repeat", "Повторить"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={filter === key ? "selected" : ""}
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              disabled={!ready}
              onClick={() => {
                if (window.confirm("Очистить ответы и отметки этой работы?")) {
                  reset(exercises.map((b) => b.id))
                  setGeneration((g) => g + 1)
                }
              }}
            >
              <RotateCcw /> Начать заново
            </Button>
          </div>
          <p className="comparison-note">
            <Info size={15} /> Сравнивайте с образцом и отмечайте разобранные
            задания. Другой перевод тоже может быть верным.
          </p>
          <div className="exercise-list">
            {lesson.notes
              .filter((n) => n.beforeRow <= 4)
              .map((n, i) => (
                <Note key={`intro-${i}`} text={n.text} />
              ))}
            {lesson.blocks.map((b) => (
              <div key={b.id}>
                {lesson.notes
                  .filter(
                    (n) =>
                      n.beforeRow > 4 &&
                      n.beforeRow <= b.row &&
                      !lesson.blocks.some(
                        (other) => other.row >= n.beforeRow && other.row < b.row
                      )
                  )
                  .map((n, i) => (
                    <Note key={i} text={n.text} />
                  ))}
                {b.kind === "heading"
                  ? filter === "all" && (
                      <h2 className="exercise-heading">{b.prompt}</h2>
                    )
                  : visible(b) && (
                      <Exercise
                        key={`${b.id}-${generation}`}
                        block={b}
                        number={exercises.indexOf(b) + 1}
                      />
                    )}
              </div>
            ))}
            {lesson.notes
              .filter((n) => n.beforeRow > (lesson.blocks.at(-1)?.row ?? 4))
              .map((n, i) => (
                <Note key={`end-${i}`} text={n.text} />
              ))}
            {!exercises.some(visible) && (
              <div className="empty-state">
                <Check />
                <h2>
                  {filter === "repeat"
                    ? "Пока нечего повторять"
                    : "Все задания заполнены"}
                </h2>
                <p>
                  Вы можете вернуться ко всем заданиям и продолжить
                  самопроверку.
                </p>
              </div>
            )}
          </div>
        </>
      )}
      <div className="lesson-pagination">
        {lesson.id > 1 ? (
          <Link className="soft-link" href={`/homework/${lesson.id - 1}`}>
            <ArrowLeft size={16} /> Работа {lesson.id - 1}
          </Link>
        ) : (
          <span />
        )}
        {lesson.id < 31 && (
          <Link className="soft-link" href={`/homework/${lesson.id + 1}`}>
            Работа {lesson.id + 1} <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </>
  )
}
function Note({ text }: { text: string }) {
  return (
    <details className="theory-note">
      <summary>
        <BookOpen size={17} /> Пояснение к заданиям <span>Раскрыть</span>
      </summary>
      <div className="prose-text">{text}</div>
    </details>
  )
}
function Exercise({ block, number }: { block: Block; number: number }) {
  const { progress, update, ready } = useProgress()
  const entry = progress.entries[block.id] ?? { text: "", mark: null }
  const [revealed, setRevealed] = useState(false)
  const [compared, setCompared] = useState(false)
  const matches =
    block.answer && normalize(entry.text) === normalize(block.answer)
  return (
    <article
      className={`exercise-card ${entry.mark === "done" ? "is-done" : ""}`}
    >
      <div className="exercise-prompt">
        <span className="exercise-number">
          {String(number).padStart(2, "0")}
        </span>
        <p>{block.prompt}</p>
        {entry.mark === "done" && <Check className="done-icon" size={19} />}
      </div>
      <label className="answer-label" htmlFor={block.id}>
        ВАШ ПЕРЕВОД
      </label>
      <textarea
        id={block.id}
        lang="en"
        disabled={!ready}
        value={entry.text}
        placeholder="Напишите по-английски…"
        onChange={(e) => {
          update(block.id, { text: e.target.value, mark: null })
          setCompared(false)
        }}
        maxLength={20000}
        rows={2}
      />
      <div className="exercise-actions">
        <div className="actions">
          <Button
            disabled={!entry.text.trim() || !block.answer || !ready}
            onClick={() => {
              setCompared(true)
              setRevealed(true)
            }}
          >
            Сравнить
          </Button>
          {block.answer && (
            <Button
              variant="ghost"
              aria-expanded={revealed}
              onClick={() => setRevealed(!revealed)}
            >
              <Eye />
              {revealed ? "Скрыть ответ" : "Показать ответ"}
            </Button>
          )}
        </div>
        <div className="actions">
          <Button
            variant={entry.mark === "done" ? "secondary" : "ghost"}
            disabled={!ready}
            aria-pressed={entry.mark === "done"}
            onClick={() =>
              update(block.id, {
                ...entry,
                mark: entry.mark === "done" ? null : "done",
              })
            }
          >
            <Check /> Разобрался
          </Button>
          <Button
            variant={entry.mark === "repeat" ? "secondary" : "ghost"}
            disabled={!ready}
            aria-pressed={entry.mark === "repeat"}
            onClick={() =>
              update(block.id, {
                ...entry,
                mark: entry.mark === "repeat" ? null : "repeat",
              })
            }
          >
            <RotateCcw /> Повторить
          </Button>
        </div>
      </div>
      {revealed && block.answer && (
        <div className="reference-answer">
          <span>
            {compared
              ? matches
                ? "СОВПАДАЕТ С ОБРАЗЦОМ"
                : "СРАВНИТЕ С ОБРАЗЦОМ"
              : "ПЕРЕВОД ПРЕПОДАВАТЕЛЯ"}
          </span>
          <p lang="en">{block.answer}</p>
          {compared && !matches && (
            <small>
              Совпадение слово в слово не обязательно. Обратите внимание на
              смысл и грамматику.
            </small>
          )}
        </div>
      )}
      {!block.answer && (
        <p className="missing-answer">
          В исходнике нет перевода преподавателя. Задание доступно для
          самостоятельной практики.
        </p>
      )}
    </article>
  )
}
