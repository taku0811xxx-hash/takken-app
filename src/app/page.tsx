'use client'

import { useState, useEffect, useMemo } from 'react'
import { Settings } from 'lucide-react'
import wordData from '@/data/words.json'
import { getCheckedWords, getExamDate } from '@/lib/storage'
import type { CheckedWords } from '@/types'

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
  const [examDate, setExamDate] = useState('2025-10-19')
  const [loading, setLoading] = useState(true)
  const words = wordData.words

  useEffect(() => {
    Promise.all([getCheckedWords(), getExamDate()])
      .then(([c, d]) => { setChecked(c); setExamDate(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const checkedCount = useMemo(() => words.filter(w => checked[w.id]).length, [words, checked])
  const progress = Math.round((checkedCount / words.length) * 100)
  const daysLeft = calcDaysLeft(examDate)
  const recentWords = useMemo(() => words.filter(w => checked[w.id]).slice(-3).reverse(), [words, checked])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-400 text-sm">読み込み中...</p></div>
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <div className="flex items-center justify-between pt-8 pb-5">
        <h1 className="text-2xl font-bold text-gray-800">宅建単語帳</h1>
        <a href="/settings" className="p-2 rounded-full bg-white border border-gray-100 text-gray-400 active:bg-gray-50">
          <Settings size={20} />
        </a>
      </div>

      {/* 試験日カウントダウン */}
      <div className="bg-gray-900 rounded-2xl p-5 mb-3 text-white">
        <p className="text-xs text-gray-400 mb-1">宅建本試験</p>
        <div className="flex items-baseline gap-2 mb-3">
          {daysLeft > 0 ? (
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
          <span className="text-xs text-gray-400">理解した単語</span>
          <span className="text-xs text-green-400 font-medium">{checkedCount}/{words.length}語 · {progress}%</span>
        </div>
        <div className="bg-gray-700 rounded-full h-1.5">
          <div className="bg-green-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* アクションボタン */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <a href="/words" className="bg-white border border-gray-100 rounded-2xl p-4 block active:bg-gray-50">
          <p className="text-2xl mb-2">📖</p>
          <p className="text-sm font-semibold text-gray-800">単語を学ぶ</p>
          <p className="text-xs text-gray-400 mt-0.5">{words.length - checkedCount}語 未チェック</p>
        </a>
        <a href="/test" className="bg-white border border-gray-100 rounded-2xl p-4 block active:bg-gray-50">
          <p className="text-2xl mb-2">🧠</p>
          <p className="text-sm font-semibold text-gray-800">テストする</p>
          <p className="text-xs text-gray-400 mt-0.5">180問 用意済み</p>
        </a>
      </div>

      {/* 最近チェックした単語 */}
      {recentWords.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">最近チェックした単語</p>
          <div className="space-y-2">
            {recentWords.map(w => (
              <div key={w.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800 flex-1">{w.word}</span>
                <span className="text-xs text-gray-400">{w.subcategory}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex">
        <a href="/" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-800">
          <span className="text-lg">🏠</span>
          <span className="text-xs font-medium">ホーム</span>
        </a>
        <a href="/words" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <span className="text-lg">📖</span>
          <span className="text-xs">単語帳</span>
        </a>
        <a href="/test" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <span className="text-lg">🧠</span>
          <span className="text-xs">テスト</span>
        </a>
        <a href="/progress" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <span className="text-lg">📊</span>
          <span className="text-xs">進捗</span>
        </a>
      </nav>
    </div>
  )
}
