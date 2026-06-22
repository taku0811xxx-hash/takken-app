'use client'

import { useState } from 'react'
import { CheckCircle, Circle, ChevronDown, ChevronUp, X, ChevronRight } from 'lucide-react'
import type { Word } from '@/types'
import wordData from '@/data/words.json'

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

// 関連単語モーダル（スタック式で芋づる可能）
function RelatedWordModal({ wordName, onClose }: { wordName: string; onClose: () => void }) {
  const [stack, setStack] = useState<Word[]>(() => {
    const found = (wordData.words as Word[]).find(w => w.word === wordName)
    return found ? [found] : []
  })

  const current = stack[stack.length - 1]

  const handleRelatedTap = (name: string) => {
    const found = (wordData.words as Word[]).find(w => w.word === name)
    if (found) setStack(s => [...s, found])
  }

  const handleBack = () => {
    if (stack.length > 1) setStack(s => s.slice(0, -1))
    else onClose()
  }

  if (!current) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
        <div className="relative bg-white rounded-t-3xl w-full max-w-lg p-6">
          <p className="text-sm text-gray-500 text-center">「{wordName}」はまだ登録されていません</p>
          <button onClick={onClose} className="mt-4 w-full py-3 bg-gray-100 rounded-xl text-sm text-gray-600">閉じる</button>
        </div>
      </div>
    )
  }

  const colorClass = subcategoryColor[current.subcategory] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          {stack.length > 1 && (
            <button onClick={handleBack} className="p-1 text-gray-400">
              <ChevronRight size={18} className="rotate-180" />
            </button>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">{current.word}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                {current.subcategory}
              </span>
            </div>
            {stack.length > 1 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {stack.slice(0, -1).map(w => w.word).join(' › ')} › {current.word}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* 本文 */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-xs text-amber-400 mb-1">{difficultyLabel(current.difficulty)}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{current.explanation}</p>
          </div>

          <div className="bg-amber-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-700 mb-1">💡 試験のポイント</p>
            <p className="text-sm text-amber-800 leading-relaxed">{current.point}</p>
          </div>

          {current.related.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">関連ワードをタップして調べる</p>
              <div className="flex flex-wrap gap-2">
                {current.related.map(r => {
                  const exists = (wordData.words as Word[]).some(w => w.word === r)
                  return (
                    <button
                      key={r}
                      onClick={() => exists && handleRelatedTap(r)}
                      className={`text-sm px-3 py-1.5 rounded-full flex items-center gap-1 transition-all ${
                        exists
                          ? 'bg-gray-800 text-white active:opacity-70'
                          : 'bg-gray-100 text-gray-400 cursor-default'
                      }`}
                    >
                      {r}
                      {exists && <ChevronRight size={12} />}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-300 mt-2">グレーの単語はまだ未登録です</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WordCard({ word, checked, onToggleCheck }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [modalWord, setModalWord] = useState<string | null>(null)
  const colorClass = subcategoryColor[word.subcategory] ?? 'bg-gray-100 text-gray-700'

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 ${checked ? 'border-green-200 opacity-75' : 'border-gray-100'}`}>
        {/* ヘッダー */}
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => onToggleCheck(word.id)}
            className="flex-shrink-0 text-green-500 active:scale-95 transition-transform"
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
            <p className="text-sm text-gray-700 leading-relaxed">{word.explanation}</p>

            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">💡 試験のポイント</p>
              <p className="text-sm text-amber-800 leading-relaxed">{word.point}</p>
            </div>

            {word.related.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">関連ワードをタップして調べる</p>
                <div className="flex flex-wrap gap-1.5">
                  {word.related.map(r => {
                    const exists = (wordData.words as Word[]).some(w => w.word === r)
                    return (
                      <button
                        key={r}
                        onClick={() => exists && setModalWord(r)}
                        className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                          exists
                            ? 'bg-gray-800 text-white active:opacity-70'
                            : 'bg-gray-100 text-gray-400 cursor-default'
                        }`}
                      >
                        {r}
                        {exists && <ChevronRight size={10} />}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-300 mt-1.5">グレーの単語はまだ未登録です</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* モーダル */}
      {modalWord && (
        <RelatedWordModal
          wordName={modalWord}
          onClose={() => setModalWord(null)}
        />
      )}
    </>
  )
}