'use client'

import { useState } from 'react'
import { CheckCircle, Circle, ChevronDown, ChevronUp, Star } from 'lucide-react'
import type { Word } from '@/types'

type Props = {
  word: Word
  checked: boolean
  onToggleCheck: (id: string) => void
}

const difficultyLabel = (d: number) => '★'.repeat(d) + '☆'.repeat(5 - d)

const subcategoryColor: Record<string, string> = {
  '物権総論': 'bg-blue-100 text-blue-700',
  '担保物権': 'bg-purple-100 text-purple-700',
  '用益物権': 'bg-green-100 text-green-700',
  '債権総論': 'bg-orange-100 text-orange-700',
  '債権各論': 'bg-orange-100 text-orange-700',
  '民法総則': 'bg-red-100 text-red-700',
  '売買契約': 'bg-yellow-100 text-yellow-700',
  '契約総論': 'bg-yellow-100 text-yellow-700',
  '不法行為': 'bg-pink-100 text-pink-700',
  '不動産登記': 'bg-teal-100 text-teal-700',
  '相続': 'bg-indigo-100 text-indigo-700',
  '借地借家法': 'bg-cyan-100 text-cyan-700',
}

export default function WordCard({ word, checked, onToggleCheck }: Props) {
  const [expanded, setExpanded] = useState(false)
  const colorClass = subcategoryColor[word.subcategory] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 ${checked ? 'border-green-200 opacity-75' : 'border-gray-100'}`}>
      {/* ヘッダー */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => onToggleCheck(word.id)}
          className="flex-shrink-0 text-green-500 active:scale-95 transition-transform"
          aria-label={checked ? '未チェックに戻す' : 'チェックする'}
        >
          {checked
            ? <CheckCircle size={26} className="fill-green-500 text-white" />
            : <Circle size={26} className="text-gray-300" />
          }
        </button>

        <button
          onClick={() => setExpanded(v => !v)}
          className="flex-1 flex items-center justify-between text-left gap-2"
        >
          <div className="flex flex-col gap-1">
            <span className={`text-lg font-bold ${checked ? 'text-gray-400' : 'text-gray-800'}`}>
              {word.word}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                {word.subcategory}
              </span>
              <span className="text-xs text-amber-400">{difficultyLabel(word.difficulty)}</span>
            </div>
          </div>
          {expanded
            ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
            : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
          }
        </button>
      </div>

      {/* 展開パネル */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">{word.explanation}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-700 mb-1">💡 試験のポイント</p>
            <p className="text-sm text-amber-800 leading-relaxed">{word.point}</p>
          </div>
          {word.related.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5">関連ワード</p>
              <div className="flex flex-wrap gap-1.5">
                {word.related.map(r => (
                  <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
