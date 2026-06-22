'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'ホーム', emoji: '🏠' },
  { href: '/words', label: '単語帳', emoji: '📖' },
  { href: '/test', label: 'テスト', emoji: '🧠' },
  { href: '/progress', label: '進捗', emoji: '📊' },
]

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* PCヘッダー */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 h-14 items-center px-8 justify-between">
        <span className="text-base font-bold text-gray-800">宅建単語帳</span>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* スマホボトムナビ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              isActive(item.href) ? 'text-gray-800' : 'text-gray-400'
            }`}
          >
            <span className="text-lg">{item.emoji}</span>
            <span className={`text-xs ${isActive(item.href) ? 'font-medium' : ''}`}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
