import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: '宅建単語帳',
  description: 'お母さんの宅建合格をサポートするアプリ',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen md:pt-14">
        <Navigation />
        {children}
      </body>
    </html>
  )
}
