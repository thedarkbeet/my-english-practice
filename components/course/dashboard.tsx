"use client"
import Link from "next/link"
import { useState, useRef } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCheck,
  Download,
  Upload,
  Search,
  Sparkles,
  RotateCcw,
} from "lucide-react"
import { course, exercises, title } from "@/lib/course"
import { useProgress } from "./progress-provider"
import { Button } from "@/components/ui/button"
export function Dashboard() {
  const { progress, ready, restore } = useProgress()
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [feedback, setFeedback] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const done = exercises.filter(
    (b) => progress.entries[b.id]?.mark === "done"
  ).length
  const filled = exercises.filter((b) =>
    progress.entries[b.id]?.text.trim()
  ).length
  const repeats = exercises.filter(
    (b) => progress.entries[b.id]?.mark === "repeat"
  ).length
  const last =
    course.lessons.find(
      (l) => l.id === progress.lastLesson && l.status === "available"
    ) ?? course.lessons[0]
  const started = Object.keys(progress.entries).length > 0
  const filteredLessons = course.lessons.filter((l) => {
    const blocks = l.blocks.filter((b) => b.kind === "exercise")
    const complete =
      blocks.length > 0 &&
      blocks.every((b) => progress.entries[b.id]?.mark === "done")
    const any = blocks.some((b) => progress.entries[b.id]?.text.trim())
    return (
      `${l.id} ${title(l.id)}`.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" ||
        (filter === "started" && any && !complete) ||
        (filter === "done" && complete) ||
        (filter === "repeat" &&
          blocks.some((b) => progress.entries[b.id]?.mark === "repeat")))
    )
  })
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(progress, null, 2)], {
        type: "application/json",
      })
    )
    const a = document.createElement("a")
    a.href = url
    a.download = "english-progress.json"
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ВАШ ПУТЬ К УВЕРЕННОМУ АНГЛИЙСКОМУ</div>
          <h1>
            Всё начинается с практики<span>.</span>
          </h1>
          <p>
            Учитесь, пробуйте, ошибайтесь. И с каждым заданием двигайтесь
            вперёд.
          </p>
        </div>
        <span className="course-pill">
          <span /> Личная тетрадь
        </span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="small-line" />{" "}
            {started
              ? "ПРОДОЛЖАЕМ ВАШЕ ОБУЧЕНИЕ"
              : "НОВАЯ ГЛАВА ВАШЕГО ОБУЧЕНИЯ"}
          </div>
          <h2>
            Ваш английский.
            <br />
            Ваш темп. <em>Ваш прогресс.</em>
          </h2>
          <p>
            Все задания и теория — в одном месте.
            <br />
            Осталось налить чашку чая и начать.
          </p>
          <Link className="primary-link" href={`/homework/${last.id}`}>
            {started ? "Продолжить обучение" : "Начать первую работу"}{" "}
            <ArrowRight size={18} />
          </Link>
          <span className="hero-footnote">
            Домашняя работа {last.id} · {title(last.id)}
          </span>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="art-star">✳</span>
          <div className="word-card card-back">
            <span>ONE STEP AT A TIME</span>
            <strong>
              Practice
              <br />
              makes progress.
            </strong>
            <div className="card-rule" />
            <p>A little better, every day.</p>
          </div>
          <div className="word-card card-front">
            <span className="card-eyebrow">WORD OF THE DAY</span>
            <div className="word-title">
              progress<span>↗</span>
            </div>
            <small>/ˈprəʊɡres/ · noun</small>
            <p>
              движение вперёд;
              <br />
              постепенное улучшение
            </p>
            <div className="card-rule" />
            <span className="card-bottom">
              SMALL STEPS, BIG CHANGES <Sparkles size={16} />
            </span>
          </div>
          <span className="art-caption">a little practice goes a long way</span>
        </div>
      </section>
      <section className="stats-grid" aria-label="Ваш прогресс">
        <div className="stat">
          <span className="stat-icon">
            <BookOpen size={19} />
          </span>
          <div>
            <span>Доступно для практики</span>
            <strong>
              21 <small>домашняя работа</small>
            </strong>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon green">
            <CheckCheck size={19} />
          </span>
          <div>
            <span>Разобрано заданий</span>
            <strong>
              {done} <small>из {exercises.length}</small>
            </strong>
          </div>
          <span className="stat-percent">
            {Math.round((done / exercises.length) * 100)}%
          </span>
        </div>
        <div className="stat">
          <span className="stat-icon amber">
            <RotateCcw size={19} />
          </span>
          <div>
            <span>На повторение</span>
            <strong>
              {repeats} <small>заданий</small>
            </strong>
          </div>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <h2>
            Домашние задания <span>31</span>
          </h2>
          <p>Выберите работу и сделайте ещё один шаг вперёд.</p>
        </div>
        <label className="search-box">
          <Search size={17} />
          <input
            aria-label="Найти домашнюю работу"
            placeholder="Номер или тема работы"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="filter-row">
        <div className="tabs" aria-label="Фильтр работ">
          {[
            ["all", "Все работы"],
            ["started", "В процессе"],
            ["done", "Завершённые"],
            ["repeat", "Повторить"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={filter === id}
              className={filter === id ? "selected" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="muted text-small">{filled} заданий заполнено</span>
      </div>
      <div className="lesson-grid">
        {filteredLessons.map((l) => {
          const blocks = l.blocks.filter((b) => b.kind === "exercise")
          const completed = blocks.filter(
            (b) => progress.entries[b.id]?.mark === "done"
          ).length
          const isStarted = blocks.some((b) =>
            progress.entries[b.id]?.text.trim()
          )
          return (
            <Link
              className={`lesson-card ${l.status !== "available" ? "unavailable" : ""}`}
              key={l.id}
              href={`/homework/${l.id}`}
            >
              <div className="lesson-card-top">
                <span className="card-number">
                  {String(l.id).padStart(2, "0")}
                </span>
                <span
                  className={`status-pill ${completed === blocks.length && blocks.length ? "complete" : ""}`}
                >
                  {l.status !== "available"
                    ? "Нет материала"
                    : completed === blocks.length
                      ? "Завершена"
                      : isStarted
                        ? "В процессе"
                        : "К практике"}
                </span>
              </div>
              <h3>Домашняя работа {l.id}</h3>
              <p>{title(l.id)}</p>
              <div className="lesson-card-bottom">
                <span>
                  {blocks.length
                    ? `${blocks.length} заданий`
                    : l.status === "empty"
                      ? "Пустой раздел в исходнике"
                      : "Заглушки в исходнике"}
                </span>
                {blocks.length > 0 && (
                  <span>
                    {completed > 0 ? (
                      `${completed}/${blocks.length}`
                    ) : (
                      <ArrowUpRight size={18} />
                    )}
                  </span>
                )}
              </div>
              {blocks.length > 0 && (
                <div className="progress-track">
                  <i
                    style={{ width: `${(completed / blocks.length) * 100}%` }}
                  />
                </div>
              )}
            </Link>
          )
        })}
      </div>
      {filteredLessons.length === 0 && (
        <div className="empty-state">По вашему запросу ничего не найдено.</div>
      )}
      <section className="backup-panel">
        <div>
          <h3>Ваш прогресс остаётся с вами</h3>
          <p>
            Ответы сохраняются в этом браузере. Скачайте копию для переноса на
            другое устройство.
          </p>
        </div>
        <div className="actions">
          <Button variant="outline" disabled={!ready} onClick={download}>
            <Download /> Скачать прогресс
          </Button>
          <Button
            variant="outline"
            disabled={!ready}
            onClick={() => input.current?.click()}
          >
            <Upload /> Загрузить
          </Button>
          <input
            ref={input}
            hidden
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              try {
                if (f.size > 5_000_000) throw new Error("Файл слишком большой.")
                const text = await f.text()
                if (
                  !window.confirm("Заменить текущий прогресс данными из файла?")
                )
                  return
                restore(text)
                setFeedback("Прогресс восстановлен.")
              } catch (err) {
                setFeedback(
                  err instanceof Error
                    ? err.message
                    : "Не удалось загрузить файл."
                )
              } finally {
                e.target.value = ""
              }
            }}
          />
        </div>
        {feedback && <p role="status">{feedback}</p>}
      </section>
    </>
  )
}
