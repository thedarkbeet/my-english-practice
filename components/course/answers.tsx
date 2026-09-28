"use client"
import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Search, ArrowUpRight } from "lucide-react"
import { course, title } from "@/lib/course"
function subscribeHash(listener: () => void) {
  window.addEventListener("hashchange", listener)
  return () => window.removeEventListener("hashchange", listener)
}
function getLessonFromHash() {
  const id = Number(window.location.hash.replace("#homework-", ""))
  return Number.isInteger(id) && id >= 1 && id <= 31 ? id : 1
}
export function Answers() {
  const selected = useSyncExternalStore(
    subscribeHash,
    getLessonFromHash,
    () => 1
  )
  const [q, setQ] = useState("")
  const lesson = course.lessons.find((l) => l.id === selected)!
  const blocks = lesson.blocks.filter(
    (b) =>
      b.kind === "exercise" &&
      `${b.prompt} ${b.answer ?? ""}`.toLowerCase().includes(q.toLowerCase())
  )
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">СРАВНИТЬ И РАЗОБРАТЬСЯ</div>
          <h1>
            Ответы к заданиям<span>.</span>
          </h1>
          <p>Переводы преподавателя для самостоятельной проверки.</p>
        </div>
      </div>
      <div className="answers-tools">
        <label className="select-label">
          Домашняя работа
          <select
            value={selected}
            onChange={(e) => {
              history.replaceState(null, "", `#homework-${e.target.value}`)
              window.dispatchEvent(new HashChangeEvent("hashchange"))
            }}
          >
            {course.lessons.map((l) => (
              <option value={l.id} key={l.id}>
                Работа {l.id} — {title(l.id)}
              </option>
            ))}
          </select>
        </label>
        <label className="search-box">
          <Search size={17} />
          <input
            aria-label="Поиск по ответам выбранной работы"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Найти предложение"
          />
        </label>
      </div>
      <div className="section-heading">
        <h2>Домашняя работа {selected}</h2>
        <Link href={`/homework/${selected}`} className="soft-link">
          К практике <ArrowUpRight size={16} />
        </Link>
      </div>
      {lesson.status !== "available" ? (
        <div className="empty-state">
          В исходнике нет учебного материала для этой работы.
        </div>
      ) : (
        <div className="answers-list">
          {blocks.map((b) => (
            <article key={b.id}>
              <span className="answer-index">
                {String(
                  lesson.blocks
                    .filter((item) => item.kind === "exercise")
                    .findIndex((item) => item.id === b.id) + 1
                ).padStart(2, "0")}
              </span>
              <div>
                <p>{b.prompt}</p>
                <p
                  lang="en"
                  className={b.answer ? "answer-translation" : "missing-answer"}
                >
                  {b.answer ?? "Перевод отсутствует в исходнике."}
                </p>
              </div>
            </article>
          ))}
          {!blocks.length && (
            <div className="empty-state">Предложения не найдены.</div>
          )}
        </div>
      )}
    </>
  )
}
