import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '宅建単語帳',
  description: 'お母さんの宅建合格をサポートするアプリ',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
