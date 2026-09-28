import type { Metadata } from "next"
import "./globals.css"
import { ProgressProvider } from "@/components/course/progress-provider"
import { Shell } from "@/components/course/shell"
export const metadata: Metadata = {
  title: { default: "English — моя учебная тетрадь", template: "%s · English" },
  description:
    "Домашние задания, теория и ваш прогресс в изучении английского.",
}
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <ProgressProvider>
          <Shell>{children}</Shell>
        </ProgressProvider>
      </body>
    </html>
  )
}
