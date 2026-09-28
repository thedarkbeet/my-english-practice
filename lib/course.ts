import data from "@/data/course.json"
export const course = data
export type Lesson = (typeof data.lessons)[number]
export type Block = Lesson["blocks"][number]
export const exercises = data.lessons.flatMap((l) =>
  l.blocks.filter((b) => b.kind === "exercise")
)
export const exerciseIds = new Set(exercises.map((b) => b.id))
export const topics: Record<number, string> = {
  1: "Первые предложения",
  2: "Глагол be и вопросы",
  3: "Вопросы и предлоги",
  4: "Прошедшее время",
  5: "It, one и новые выражения",
  6: "Вопросы и there is / are",
  7: "Действия и привычки",
  8: "Артикли и герундий",
  9: "Continuous и сложные предложения",
  10: "Опыт и привычки",
  11: "Времена в контексте",
  12: "Практика перевода",
  13: "Present Perfect",
  14: "Perfect или Past Simple?",
  15: "Have to и полезные выражения",
  17: "Работа и жизненный опыт",
  18: "Короткие ответы",
  19: "С тех пор как…",
  20: "Perfect Continuous и вероятность",
  21: "Чувства и герундий",
  22: "Предлоги и герундий",
}
export function title(id: number) {
  return topics[id] ?? "Материал ожидается"
}
