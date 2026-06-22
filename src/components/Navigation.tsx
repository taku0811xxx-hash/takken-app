'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'ホーム', emoji: '🏠' },
  { href: '/words', label: '単語帳', emoji: '📖' },
  { href: '/test', label: 'テスト', emoji: '🧠' },
  { href: '/progress', label: '進捗', emoji: '📊' },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOutUser } = useAuth()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // loadingが完全に終わってから判断・少し待ってリダイレクト
    if (loading) return
    if (!user && pathname !== '/login' && !redirecting) {
      setRedirecting(true)
      setTimeout(() => {
        router.push('/login')
      }, 100)
    }
    if (user && redirecting) {
      setRedirecting(false)
    }
  }, [user, loading, pathname, router, redirecting])

  if (pathname === '/login') return null
  if (loading || (!user && pathname !== '/login')) return null

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
                isActive(item.href) ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-100">
              {user.photoURL && <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />}
              <button
                onClick={signOutUser}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
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
