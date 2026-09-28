import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { normalize, parseProgress } from "../lib/progress.ts"
const data = JSON.parse(
  readFileSync(new URL("../data/course.json", import.meta.url))
)
const exercises = data.lessons.flatMap((l) =>
  l.blocks.filter((b) => b.kind === "exercise")
)
const ids = new Set(exercises.map((b) => b.id))
test("all course content is accounted for, excluding documented placeholders", () => {
  assert.equal(data.lessons.length, 31)
  assert.equal(exercises.length, 1403)
  assert.equal(ids.size, 1403)
  assert.equal(
    data.lessons.reduce((n, l) => n + l.sourceRows, 0),
    1903
  )
  assert.equal(data.lessons.flatMap((l) => l.blocks).length, 1442)
  assert.equal(data.lessons.filter((l) => l.status === "available").length, 21)
  assert.equal(exercises.filter((b) => !b.answer).length, 2)
  assert.deepEqual(
    exercises.filter((b) => !b.answer).map((b) => b.source),
    ["Ответы!C72", "Ответы!X85"]
  )
  assert.equal(data.rules.length, 3)
})
test("unavailable lessons have no fake exercises", () => {
  assert.equal(data.lessons[15].status, "empty")
  for (const l of data.lessons.slice(22)) {
    assert.equal(l.status, "placeholder")
    assert.equal(l.blocks.length, 0)
  }
})
test("teaching notes survive independently of existing answers", () => {
  const notes = data.lessons.flatMap((l) => l.notes)
  for (const source of ["h_9!C34", "h_9!C96", "h_15!B65", "h_17!F4"])
    assert.ok(notes.some((n) => n.source === source))
  assert.ok(!JSON.stringify(data).includes('"фф"'))
})
test("comparison normalizes typography but preserves grammar and punctuation", () => {
  assert.equal(normalize("  I’m   happy  "), normalize("i'm happy"))
  assert.notEqual(normalize("He work"), normalize("He works"))
  assert.notEqual(normalize("He works?"), normalize("He works."))
})
test("progress round-trip retains answers and marks", () => {
  const value = {
    version: 1,
    lastLesson: 8,
    entries: {
      [exercises[0].id]: { text: "He leaves home at 9", mark: "repeat" },
    },
  }
  assert.deepEqual(parseProgress(JSON.stringify(value), ids), value)
})
test("invalid imports cannot silently assign answers to another course", () => {
  for (const value of [
    { version: 2, entries: {}, lastLesson: 1 },
    { version: 1, entries: [], lastLesson: 1 },
    {
      version: 1,
      entries: { bad: { text: "test", mark: null } },
      lastLesson: 1,
    },
    {
      version: 1,
      entries: { [exercises[0].id]: { text: 123, mark: "done" } },
      lastLesson: 1,
    },
    { version: 1, entries: {}, lastLesson: 32 },
  ])
    assert.throws(() => parseProgress(JSON.stringify(value), ids))
  assert.throws(() => parseProgress("not json", ids))
})
