'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Brain, CheckSquare } from 'lucide-react'
import wordData from '@/data/words.json'
import { getCheckedWords, getWeakWords } from '@/lib/storage'
import type { WeakWord } from '@/types'

export default function ProgressPage() {
  const [checkedCount, setCheckedCount] = useState(0)
  const [weakWords, setWeakWords] = useState<WeakWord[]>([])
  const [loading, setLoading] = useState(true)

  const words = wordData.words
  const wordMap = Object.fromEntries(words.map(w => [w.id, w]))

  useEffect(() => {
    Promise.all([getCheckedWords(), getWeakWords()])
      .then(([checked, weak]) => {
        setCheckedCount(Object.values(checked).filter(Boolean).length)
        setWeakWords(weak.slice(0, 10))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const progress = Math.round((checkedCount / words.length) * 100)

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <div className="pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">進捗</h1>
      </div>

      {/* 全体進捗 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
        <p className="text-sm text-gray-500 mb-1">単語の理解度</p>
        <p className="text-3xl font-bold text-gray-800 mb-3">{progress}<span className="text-lg font-normal text-gray-400">%</span></p>
        <div className="bg-gray-100 rounded-full h-3">
          <div className="bg-green-400 h-3 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">{checkedCount} / {words.length}語 チェック済み</p>
      </div>

      {/* 苦手単語ランキング */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-3">
          苦手な単語 Top{weakWords.length}
        </p>
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">読み込み中...</p>
        ) : weakWords.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">テストを受けると苦手分析が表示されます</p>
            <a href="/test" className="text-sm text-gray-800 font-medium underline mt-2 block">テストを受ける →</a>
          </div>
        ) : (
          <div className="space-y-2">
            {weakWords.map((w, i) => {
              const word = wordMap[w.wordId]
              if (!word) return null
              const rate = Math.round(w.correctRate * 100)
              return (
                <div key={w.wordId} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{word.word}</p>
                    <p className="text-xs text-gray-400">{word.subcategory}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${rate < 50 ? 'text-red-500' : 'text-orange-400'}`}>{rate}%</p>
                    <p className="text-xs text-gray-400">{w.attempts}回</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex">
        <a href="/" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <BookOpen size={20} />
          <span className="text-xs">単語帳</span>
        </a>
        <a href="/test" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <Brain size={20} />
          <span className="text-xs">テスト</span>
        </a>
        <a href="/progress" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-800">
          <CheckSquare size={20} />
          <span className="text-xs font-medium">進捗</span>
        </a>
      </nav>
    </div>
  )
}
