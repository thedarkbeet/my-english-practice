"use client"
import { useState } from "react"
import Link from "next/link"
import { Search, ArrowUpRight } from "lucide-react"
import { course } from "@/lib/course"
export function Theory() {
  const [q, setQ] = useState("")
  const [tab, setTab] = useState("prepositions")
  const contains = (s: string) => s.toLowerCase().includes(q.toLowerCase())
  const theory = course.theory.filter((t) => contains(JSON.stringify(t)))
  const notes = course.lessons
    .flatMap((l) => l.notes.map((n) => ({ ...n, lesson: l.id })))
    .filter((n) => contains(n.text))
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ЗНАНИЯ ПОД РУКОЙ</div>
          <h1>
            Немного теории<span>.</span>
          </h1>
          <p>Предлоги, примеры и пояснения к домашним заданиям.</p>
        </div>
      </div>
      <div className="section-heading">
        <div className="tabs">
          <button
            aria-pressed={tab === "prepositions"}
            className={tab === "prepositions" ? "selected" : ""}
            onClick={() => setTab("prepositions")}
          >
            Предлоги
          </button>
          <button
            aria-pressed={tab === "notes"}
            className={tab === "notes" ? "selected" : ""}
            onClick={() => setTab("notes")}
          >
            Пояснения к работам
          </button>
        </div>
        <label className="search-box">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Поиск по теории"
            placeholder="Найти правило или пример"
          />
        </label>
      </div>
      <p className="comparison-note">
        Материалы преподавателя из исходной таблицы. Пояснения сохранены; полная
        языковая вычитка ещё не выполнена.
      </p>
      {tab === "prepositions" ? (
        <div className="theory-grid">
          {theory.map((t, i) => (
            <article className="theory-card" key={i}>
              <div className="theory-term">
                {t.term}
                <span>PREPOSITION</span>
              </div>
              {t.entries.map((e, j) => (
                <div className="theory-entry" key={j}>
                  {e.meaning && <p>{e.meaning}</p>}
                  {e.example && <blockquote>{e.example}</blockquote>}
                </div>
              ))}
            </article>
          ))}
          {!theory.length && (
            <p className="empty-state">
              Ничего не найдено. Попробуйте другое слово.
            </p>
          )}
        </div>
      ) : (
        <div className="notes-list">
          {notes.map((n, i) => (
            <details key={i} className="theory-note">
              <summary>
                Работа {n.lesson} · {n.text.split("\n")[0].slice(0, 95)}
              </summary>
              <div className="prose-text">{n.text}</div>
              <Link className="soft-link" href={`/homework/${n.lesson}`}>
                Перейти к работе <ArrowUpRight size={15} />
              </Link>
            </details>
          ))}
          {!notes.length && (
            <p className="empty-state">Пояснения не найдены.</p>
          )}
        </div>
      )}
    </>
  )
}
