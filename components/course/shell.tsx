"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  BookOpen,
  LayoutDashboard,
  ListChecks,
  LibraryBig,
  ArrowUpRight,
  Menu,
  X,
  Check,
  ChevronRight,
} from "lucide-react"
import { course, exercises } from "@/lib/course"
import { useProgress } from "./progress-provider"
import { Button } from "@/components/ui/button"
const links = [
  { href: "/", text: "Моё обучение", icon: LayoutDashboard },
  { href: "/rules", text: "Правила курса", icon: ListChecks },
  { href: "/theory", text: "Теория", icon: LibraryBig },
  { href: "/answers", text: "Ответы", icon: BookOpen },
]
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const { progress, message } = useProgress()
  const done = exercises.filter(
    (b) => progress.entries[b.id]?.mark === "done"
  ).length
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Перейти к содержимому
      </a>
      <div className="mobile-bar">
        <Link href="/" className="brand">
          e<span>nglish.</span>
        </Link>
        <Button
          variant="outline"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Закрыть меню"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="Навигация курса"
      >
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-symbol">e</span>english
          <span className="brand-dot">.</span>
        </Link>
        <div className="sidebar-caption">МОЯ УЧЕБНАЯ ТЕТРАДЬ</div>
        <nav className="main-nav">
          {links.map(({ href, text, icon: Icon }) => (
            <Link
              onClick={() => setOpen(false)}
              aria-current={path === href ? "page" : undefined}
              className={path === href ? "active" : ""}
              href={href}
              key={href}
            >
              <Icon size={18} />
              {text}
              {path === href && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-section-label">
          ДОМАШНИЕ ЗАДАНИЯ <span>31</span>
        </div>
        <nav className="lesson-nav" aria-label="Домашние задания">
          {course.lessons.map((l) => {
            const count = l.blocks.filter((b) => b.kind === "exercise").length
            const completed =
              count > 0 &&
              l.blocks
                .filter((b) => b.kind === "exercise")
                .every((b) => progress.entries[b.id]?.mark === "done")
            return (
              <Link
                href={`/homework/${l.id}`}
                key={l.id}
                onClick={() => setOpen(false)}
                className={path === `/homework/${l.id}` ? "active" : ""}
                aria-current={path === `/homework/${l.id}` ? "page" : undefined}
              >
                <span className="lesson-nav-number">
                  {String(l.id).padStart(2, "0")}
                </span>
                Домашняя работа {l.id}
                {completed ? (
                  <Check size={14} />
                ) : l.status !== "available" ? (
                  <span className="empty-dot" title="Материал отсутствует" />
                ) : (
                  <ChevronRight size={13} />
                )}
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <span>Маленькие шаги. Большой результат.</span>
          <div>
            <strong>{Math.round((done / exercises.length) * 100)}%</strong>{" "}
            курса разобрано <ArrowUpRight size={15} />
          </div>
          <div className="progress-track">
            <i style={{ width: `${(done / exercises.length) * 100}%` }} />
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Личное пространство <span className="breadcrumb-divider">/</span>{" "}
            <strong>Английский язык</strong>
          </span>
          <span className="private-label">
            <span /> В своём темпе
          </span>
        </header>
        <main id="main">
          {message && (
            <p role="alert" className="notice">
              {message}
            </p>
          )}
          {children}
        </main>
        <footer className="site-footer">
          <span>
            english. <span>Практика каждый день.</span>
          </span>
          <span>Сделано для вашего обучения</span>
        </footer>
      </div>
    </div>
  )
}
