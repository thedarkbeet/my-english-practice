import { course } from "@/lib/course"
import Link from "next/link"
import { ArrowRight, HeartHandshake } from "lucide-react"
export const metadata = { title: "Правила курса" }
export default function Page() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ПЕРЕД ПЕРВЫМ ЗАДАНИЕМ</div>
          <h1>
            Учиться — значит пробовать<span>.</span>
          </h1>
          <p>
            Несколько простых правил, которые помогут получить больше от
            практики.
          </p>
        </div>
      </div>
      <section className="rules-intro">
        <HeartHandshake size={34} />
        <h2>Здесь можно ошибаться.</h2>
        <p>
          Ваша цель — разобраться и двигаться дальше. Идеальный ответ с первой
          попытки не обязателен.
        </p>
      </section>
      <div className="rules-list">
        {course.rules.map((rule, i) => (
          <article key={rule}>
            <span>0{i + 1}</span>
            <div>
              <h2>
                {
                  [
                    "Ошибки — часть пути",
                    "Сравнивайте и разбирайтесь",
                    "Задавайте вопросы",
                  ][i]
                }
              </h2>
              <p>{rule}</p>
            </div>
          </article>
        ))}
      </div>
      <Link className="primary-link" href="/homework/1">
        Перейти к практике <ArrowRight size={17} />
      </Link>
    </>
  )
}
