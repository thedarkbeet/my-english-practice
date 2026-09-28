export type Entry = { text: string; mark: "done" | "repeat" | null }
export type Progress = {
  version: 1
  entries: Record<string, Entry>
  lastLesson: number
}
export const emptyProgress: Progress = {
  version: 1,
  entries: {},
  lastLesson: 1,
}
export const storageKey = "english-notebook.progress.v1"
export function normalize(text: string) {
  return text
    .trim()
    .toLocaleLowerCase("en")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
}
export function parseProgress(raw: string, ids: Set<string>): Progress {
  const value = JSON.parse(raw)
  if (
    !value ||
    value.version !== 1 ||
    !value.entries ||
    typeof value.entries !== "object" ||
    Array.isArray(value.entries) ||
    !Number.isInteger(value.lastLesson) ||
    value.lastLesson < 1 ||
    value.lastLesson > 31
  )
    throw new Error("Некорректный файл прогресса или неподдерживаемая версия.")
  const entries: Record<string, Entry> = {}
  for (const [id, item] of Object.entries(value.entries)) {
    if (!ids.has(id))
      throw new Error(
        "Файл относится к другой версии материалов. Текущие ответы сохранены."
      )
    const entry = item as Entry
    if (
      !entry ||
      typeof entry.text !== "string" ||
      entry.text.length > 20000 ||
      ![null, "done", "repeat"].includes(entry.mark)
    )
      throw new Error("Файл содержит некорректные ответы.")
    entries[id] = { text: entry.text, mark: entry.mark }
  }
  return { version: 1, entries, lastLesson: value.lastLesson }
}
