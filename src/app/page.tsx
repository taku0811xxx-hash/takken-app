'use client'

import { useState, useEffect, useMemo } from 'react'
import { Settings } from 'lucide-react'
import wordData from '@/data/words.json'
import { getCheckedWords, getExamDate } from '@/lib/storage'
import type { CheckedWords } from '@/types'

const CATEGORIES = [
  { prefix: 'k', label: '権利関係', emoji: '⚖️', color: 'bg-blue-50 border-blue-100', accent: 'text-blue-600' },
  { prefix: 't', label: '宅建業法', emoji: '🏢', color: 'bg-green-50 border-green-100', accent: 'text-green-600' },
  { prefix: 'h', label: '法令上の制限', emoji: '📋', color: 'bg-orange-50 border-orange-100', accent: 'text-orange-600' },
  { prefix: 'z', label: '税・その他', emoji: '💴', color: 'bg-purple-50 border-purple-100', accent: 'text-purple-600' },
]

function calcDaysLeft(dateStr: string): number {
  const exam = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export default function Home() {
  const [checked, setChecked] = useState<CheckedWords>({})
  const [examDate, setExamDate] = useState('')
  const [loading, setLoading] = useState(true)
  const words = wordData.words

  useEffect(() => {
    Promise.all([getCheckedWords(), getExamDate()])
      .then(([c, d]) => { setChecked(c); setExamDate(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categoryStats = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catWords = words.filter(w => w.id.startsWith(cat.prefix))
      const checkedCount = catWords.filter(w => checked[w.id]).length
      const progress = catWords.length > 0 ? Math.round((checkedCount / catWords.length) * 100) : 0
      return { ...cat, total: catWords.length, checkedCount, progress }
    })
  }, [words, checked])

  const totalChecked = useMemo(() => words.filter(w => checked[w.id]).length, [words, checked])
  const totalProgress = Math.round((totalChecked / words.length) * 100)
  const daysLeft = examDate ? calcDaysLeft(examDate) : null

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-400 text-sm">読み込み中...</p></div>
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      {/* ヘッダー */}
      <div className="flex items-center justify-between pt-8 pb-5">
        <h1 className="text-2xl font-bold text-gray-800">宅建単語帳</h1>
        <a href="/settings" className="p-2 rounded-full bg-white border border-gray-100 text-gray-400">
          <Settings size={20} />
        </a>
      </div>

      {/* カウントダウン */}
      <div className="bg-gray-900 rounded-2xl p-5 mb-4 text-white">
        <p className="text-xs text-gray-400 mb-1">宅建本試験</p>
        <div className="flex items-baseline gap-2 mb-3">
          {daysLeft !== null && daysLeft > 0 ? (
            <>
              <span className="text-4xl font-bold">{daysLeft}</span>
              <span className="text-base text-gray-400">日後</span>
              <span className="text-sm text-gray-500 ml-auto">{formatDate(examDate)}</span>
            </>
          ) : daysLeft === 0 ? (
            <span className="text-2xl font-bold">今日が試験日！</span>
          ) : (
            <span className="text-xl font-bold text-gray-400">試験終了</span>
          )}
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-400">全体の理解度</span>
          <span className="text-xs text-green-400 font-medium">{totalChecked}/{words.length}語 · {totalProgress}%</span>
        </div>
        <div className="bg-gray-700 rounded-full h-1.5">
          <div className="bg-green-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${totalProgress}%` }} />
        </div>
      </div>

      {/* 4教科カード */}
      <p className="text-xs font-semibold text-gray-400 mb-3">教科を選んで学習する</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {categoryStats.map(cat => (
          <a
            key={cat.prefix}
            href={`/words?category=${cat.prefix}`}
            className={`${cat.color} border rounded-2xl p-4 block active:opacity-80 transition-opacity`}
          >
            <p className="text-2xl mb-2">{cat.emoji}</p>
            <p className="text-sm font-semibold text-gray-800 leading-tight mb-1">{cat.label}</p>
            <p className="text-xs text-gray-500 mb-2">{cat.total}語</p>
            <div className="bg-white bg-opacity-60 rounded-full h-1.5 mb-1">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${cat.progress}%`,
                  backgroundColor: cat.prefix === 'k' ? '#3b82f6' : cat.prefix === 't' ? '#22c55e' : cat.prefix === 'h' ? '#f97316' : '#a855f7'
                }}
              />
            </div>
            <p className={`text-xs font-medium ${cat.accent}`}>{cat.progress}% 完了</p>
          </a>
        ))}
      </div>

      {/* テストボタン */}
      <a href="/test" className="bg-gray-800 text-white rounded-2xl p-4 flex items-center gap-3 active:opacity-80">
        <span className="text-2xl">🧠</span>
        <div>
          <p className="text-sm font-semibold">テストする</p>
          <p className="text-xs text-gray-400 mt-0.5">苦手単語を中心に出題</p>
        </div>
        <span className="ml-auto text-gray-400">›</span>
      </a>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex">
        <a href="/" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-800">
          <span className="text-lg">🏠</span><span className="text-xs font-medium">ホーム</span>
        </a>
        <a href="/words" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <span className="text-lg">📖</span><span className="text-xs">単語帳</span>
        </a>
        <a href="/test" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <span className="text-lg">🧠</span><span className="text-xs">テスト</span>
        </a>
        <a href="/progress" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <span className="text-lg">📊</span><span className="text-xs">進捗</span>
        </a>
      </nav>
    </div>
  )
}
