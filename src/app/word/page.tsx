'use client'

import { useState, useEffect, useMemo } from 'react'
import WordCard from '@/components/WordCard'
import wordData from '@/data/words.json'
import { getCheckedWords, saveCheckedWords } from '@/lib/storage'
import type { CheckedWords } from '@/types'

type Tab = 'all' | 'unchecked' | 'checked'

export default function WordsPage() {
  const [checked, setChecked] = useState<CheckedWords>({})
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [loading, setLoading] = useState(true)
  const words = wordData.words

  useEffect(() => {
    getCheckedWords()
      .then(data => setChecked(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleToggleCheck = async (id: string) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    try { await saveCheckedWords(next) } catch {}
  }

  const filteredWords = useMemo(() => {
    if (activeTab === 'checked') return words.filter(w => checked[w.id])
    if (activeTab === 'unchecked') return words.filter(w => !checked[w.id])
    return words
  }, [words, checked, activeTab])

  const checkedCount = words.filter(w => checked[w.id]).length

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-400 text-sm">読み込み中...</p></div>
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <div className="pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">単語帳</h1>
        <p className="text-sm text-gray-400 mt-1">権利関係 — {words.length}語</p>
      </div>

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
              activeTab === tab ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {label}({count})
          </button>
        ))}
      </div>

      <div className="space-y-2">
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex">
        <a href="/" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <span className="text-lg">🏠</span><span className="text-xs">ホーム</span>
        </a>
        <a href="/words" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-800">
          <span className="text-lg">📖</span><span className="text-xs font-medium">単語帳</span>
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
