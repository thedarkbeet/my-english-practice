"use client"
import { createContext, useContext, useSyncExternalStore } from "react"
import {
  emptyProgress,
  storageKey,
  parseProgress,
  type Progress,
  type Entry,
} from "@/lib/progress"
import { exerciseIds } from "@/lib/course"
type Snapshot = { progress: Progress; ready: boolean; message: string }
const initial: Snapshot = { progress: emptyProgress, ready: false, message: "" }
let snapshot = initial
const listeners = new Set<() => void>()
function emit() {
  listeners.forEach((listener) => listener())
}
function load() {
  try {
    const raw = localStorage.getItem(storageKey)
    snapshot = {
      progress: raw ? parseProgress(raw, exerciseIds) : emptyProgress,
      ready: true,
      message: "",
    }
  } catch {
    snapshot = {
      ...snapshot,
      ready: true,
      message:
        "Не удалось загрузить сохранение. Экспортируйте новые ответы перед закрытием страницы.",
    }
  }
  emit()
}
function onStorage(event: StorageEvent) {
  if (event.key === storageKey || event.key === null) load()
}
function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!snapshot.ready) load()
  if (listeners.size === 1) window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    if (!listeners.size) window.removeEventListener("storage", onStorage)
  }
}
function commit(progress: Progress) {
  let message = ""
  try {
    localStorage.setItem(storageKey, JSON.stringify(progress))
  } catch {
    message =
      "Браузер не сохранил изменения. Экспортируйте прогресс, чтобы не потерять ответы."
  }
  snapshot = { progress, ready: true, message }
  emit()
}
function update(id: string, entry: Entry) {
  commit({
    ...snapshot.progress,
    entries: { ...snapshot.progress.entries, [id]: entry },
  })
}
function visit(id: number) {
  if (snapshot.progress.lastLesson !== id)
    commit({ ...snapshot.progress, lastLesson: id })
}
function reset(ids: string[]) {
  const entries = { ...snapshot.progress.entries }
  ids.forEach((id) => delete entries[id])
  commit({ ...snapshot.progress, entries })
}
function restore(raw: string) {
  commit(parseProgress(raw, exerciseIds))
}
const Context = createContext<
  | (Snapshot & {
      update: typeof update
      visit: typeof visit
      reset: typeof reset
      restore: typeof restore
    })
  | null
>(null)
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const value = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => initial
  )
  return (
    <Context.Provider value={{ ...value, update, visit, reset, restore }}>
      {children}
    </Context.Provider>
  )
}
export function useProgress() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error("ProgressProvider is required")
  return ctx
}
