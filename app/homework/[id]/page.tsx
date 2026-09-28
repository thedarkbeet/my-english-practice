import { notFound } from "next/navigation"
import { course } from "@/lib/course"
import { LessonPage } from "@/components/course/lesson"
export function generateStaticParams() {
  return course.lessons.map((l) => ({ id: String(l.id) }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return { title: `Домашняя работа ${id}` }
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lesson = course.lessons.find((l) => String(l.id) === id)
  if (!lesson) notFound()
  return <LessonPage key={lesson.id} lesson={lesson} />
}
