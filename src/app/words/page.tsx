'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import WordCard from '@/components/WordCard'
import wordData from '@/data/words.json'
import { getCheckedWords, saveCheckedWords } from '@/lib/storage'
import type { CheckedWords } from '@/types'

const CATEGORIES = [
  { prefix: 'k', label: '権利関係', emoji: '⚖️' },
  { prefix: 't', label: '宅建業法', emoji: '🏢' },
  { prefix: 'h', label: '法令上の制限', emoji: '📋' },
  { prefix: 'z', label: '税・その他', emoji: '💴' },
]

type Tab = 'all' | 'unchecked' | 'checked'

function WordsContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category') || 'k'

  const [checked, setChecked] = useState<CheckedWords>({})
  const [activeCategory, setActiveCategory] = useState(categoryParam)
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

  const categoryWords = useMemo(() =>
    words.filter(w => w.id.startsWith(activeCategory)),
    [words, activeCategory]
  )

  const filteredWords = useMemo(() => {
    if (activeTab === 'checked') return categoryWords.filter(w => checked[w.id])
    if (activeTab === 'unchecked') return categoryWords.filter(w => !checked[w.id])
    return categoryWords
  }, [categoryWords, checked, activeTab])

  const checkedCount = categoryWords.filter(w => checked[w.id]).length
  const currentCat = CATEGORIES.find(c => c.prefix === activeCategory)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-400 text-sm">読み込み中...</p></div>
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <div className="pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">単語帳</h1>
      </div>

      {/* 教科タブ */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.prefix}
            onClick={() => { setActiveCategory(cat.prefix); setActiveTab('all') }}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
              activeCategory === cat.prefix ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 進捗 */}
      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
        <span className="text-xl">{currentCat?.emoji}</span>
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">{currentCat?.label}</span>
            <span className="text-gray-700 font-medium">{checkedCount}/{categoryWords.length}語</span>
          </div>
          <div className="bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${categoryWords.length > 0 ? Math.round(checkedCount / categoryWords.length * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* フィルタタブ */}
      <div className="flex gap-2 mb-4">
        {([
          ['all', 'すべて', categoryWords.length],
          ['unchecked', '未チェック', categoryWords.length - checkedCount],
          ['checked', '理解済み', checkedCount],
        ] as [Tab, string, number][]).map(([tab, label, count]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === tab ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {label}({count})
          </button>
        ))}
      </div>

      {/* 単語リスト */}
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

export default function WordsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-400 text-sm">読み込み中...</p></div>}>
      <WordsContent />
    </Suspense>
  )
}
