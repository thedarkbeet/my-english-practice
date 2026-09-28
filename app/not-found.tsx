import Link from "next/link"
export default function NotFound() {
  return (
    <div className="empty-state">
      <div className="eyebrow">404</div>
      <h1>Такой страницы нет</h1>
      <p>В курсе есть домашние работы с 1 по 31.</p>
      <Link className="primary-link" href="/">
        Вернуться к заданиям
      </Link>
    </div>
  )
}
