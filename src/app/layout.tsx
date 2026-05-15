import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '../store/providers'

export const metadata: Metadata = {
  title: 'AI Voice Chat',
  description: 'Минимальный ассистент с голосовым вводом',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
