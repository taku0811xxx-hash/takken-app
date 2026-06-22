'use client'

import { useState, useEffect, useMemo } from 'react'
import { BookOpen, CheckSquare, Brain } from 'lucide-react'
import WordCard from '@/components/WordCard'
import wordData from '@/data/words.json'
import { getCheckedWords, saveCheckedWords } from '@/lib/storage'
import type { CheckedWords } from '@/types'

type Tab = 'all' | 'unchecked' | 'checked'

export default function Home() {
  const [checked, setChecked] = useState<CheckedWords>({})
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [loading, setLoading] = useState(true)

  const words = wordData.words

  useEffect(() => {
    getCheckedWords()
      .then(data => setChecked(data))
      .catch(() => {}) // Firebase未設定時はローカルで動作
      .finally(() => setLoading(false))
  }, [])

  const handleToggleCheck = async (id: string) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    try {
      await saveCheckedWords(next)
    } catch {
      // Firebase未設定時はローカル状態のみ更新
    }
  }

  const filteredWords = useMemo(() => {
    if (activeTab === 'checked') return words.filter(w => checked[w.id])
    if (activeTab === 'unchecked') return words.filter(w => !checked[w.id])
    return words
  }, [words, checked, activeTab])

  const checkedCount = words.filter(w => checked[w.id]).length
  const progress = Math.round((checkedCount / words.length) * 100)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      {/* ヘッダー */}
      <div className="pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">宅建単語帳</h1>
        <p className="text-sm text-gray-400 mt-1">権利関係 — {words.length}語</p>
      </div>

      {/* 進捗バー */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">理解できた単語</span>
          <span className="text-sm font-bold text-green-600">{checkedCount} / {words.length}語</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-right">{progress}% 完了</p>
      </div>

      {/* タブ */}
      <div className="flex gap-2 mb-4">
        {([
          ['all', 'すべて', words.length],
          ['unchecked', '未チェック', words.length - checkedCount],
          ['checked', '理解済み', checkedCount],
        ] as [Tab, string, number][]).map(([tab, label, count]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === tab
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* 単語リスト */}
      <div className="space-y-3">
        {filteredWords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">{activeTab === 'checked' ? 'まだチェックした単語がありません' : 'すべての単語を理解しました！'}</p>
          </div>
        ) : (
          filteredWords.map(word => (
            <WordCard
              key={word.id}
              word={word as any}
              checked={!!checked[word.id]}
              onToggleCheck={handleToggleCheck}
            />
          ))
        )}
      </div>

      {/* 下部ナビ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex">
        <a href="/" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-800">
          <BookOpen size={20} />
          <span className="text-xs font-medium">単語帳</span>
        </a>
        <a href="/test" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <Brain size={20} />
          <span className="text-xs">テスト</span>
        </a>
        <a href="/progress" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <CheckSquare size={20} />
          <span className="text-xs">進捗</span>
        </a>
      </nav>
    </div>
  )
}
