'use client'

import { useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import curriculumData from '@/data/curriculum.json'
import wordData from '@/data/words.json'
import WordCard from '@/components/WordCard'
import { getCheckedWords, saveCheckedWords } from '@/lib/storage'
import type { CheckedWords } from '@/types'

const SUBJECT_COLORS: Record<string, { bar: string; bg: string }> = {
  k: { bar: '#3b82f6', bg: 'bg-blue-50' },
  t: { bar: '#22c55e', bg: 'bg-green-50' },
  h: { bar: '#f97316', bg: 'bg-orange-50' },
  z: { bar: '#a855f7', bg: 'bg-purple-50' },
}

export default function UnitPage({ params }: { params: { id: string; unitId: string } }) {
  const id = params.id
  const unitId = params.unitId
  const [checked, setChecked] = useState<CheckedWords>({})
  const [loading, setLoading] = useState(true)

  const subject = curriculumData.subjects.find(s => s.id === id)
  const unit = subject?.units.find(u => u.id === unitId)
  const color = SUBJECT_COLORS[id] || SUBJECT_COLORS.k

  useEffect(() => {
    getCheckedWords().then(setChecked).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleToggleCheck = async (wid: string) => {
    const next = { ...checked, [wid]: !checked[wid] }
    const prev = { ...checked }
    setChecked(next)
    try { await saveCheckedWords(next, prev) } catch {}
  }

  const unitWords = useMemo(() => {
    if (!unit) return []
    return unit.wordIds.map(wid => wordData.words.find(w => w.id === wid)).filter(Boolean)
  }, [unit])

  const checkedCount = unitWords.filter(w => w && checked[w.id]).length
  const progress = unitWords.length > 0 ? Math.round(checkedCount / unitWords.length * 100) : 0

  const units = subject?.units || []
  const unitIndex = units.findIndex(u => u.id === unitId)
  const prevUnit = unitIndex > 0 ? units[unitIndex - 1] : null
  const nextUnit = unitIndex < units.length - 1 ? units[unitIndex + 1] : null

  if (!subject || !unit) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-400 text-sm">単元が見つかりません</p></div>

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 md:pb-8">
      <div className="flex items-center gap-3 pt-8 pb-4">
        <Link href={`/subject/${id}`} className="p-2 rounded-full bg-white border border-gray-100 text-gray-400">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-xs text-gray-400">{subject.emoji} {subject.label}</p>
          <h1 className="text-lg font-bold text-gray-800">{unit.title}</h1>
        </div>
      </div>

      <div className={`${color.bg} rounded-2xl p-4 mb-4`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">この単元の進捗</span>
          <span className="text-xs font-semibold text-gray-600">{checkedCount}/{unitWords.length}語 · {progress}%</span>
        </div>
        <div className="bg-white bg-opacity-60 rounded-full h-1.5 mb-3">
          <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: color.bar }} />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{unit.overview}</p>

        <div className="bg-white bg-opacity-50 rounded-xl p-3 mb-2">
          <p className="text-xs font-semibold text-gray-600 mb-2">📌 キーポイント</p>
          <ul className="space-y-1">
            {unit.keyPoints.map((point, i) => (
              <li key={i} className="text-xs text-gray-600 flex gap-2">
                <span className="flex-shrink-0 font-bold" style={{ color: color.bar }}>{i + 1}.</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white bg-opacity-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-600 mb-1">💡 学習のコツ</p>
          <p className="text-xs text-gray-600 leading-relaxed">{unit.studyTip}</p>
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-400 mb-3">この単元の単語（{unitWords.length}語）</p>
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">読み込み中...</p>
      ) : (
        <div className="space-y-2 mb-6">
          {unitWords.map(word => word && (
            <WordCard key={word.id} word={word as any} checked={!!checked[word.id]} onToggleCheck={handleToggleCheck} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {prevUnit ? (
          <Link href={`/subject/${id}/unit/${prevUnit.id}`} className="bg-white border border-gray-100 rounded-xl p-3 text-left active:opacity-80">
            <p className="text-xs text-gray-400 mb-1">← 前の単元</p>
            <p className="text-sm font-medium text-gray-700 truncate">{prevUnit.title}</p>
          </Link>
        ) : <div />}
        {nextUnit ? (
          <Link href={`/subject/${id}/unit/${nextUnit.id}`} className="bg-white border border-gray-100 rounded-xl p-3 text-right active:opacity-80">
            <p className="text-xs text-gray-400 mb-1">次の単元 →</p>
            <p className="text-sm font-medium text-gray-700 truncate">{nextUnit.title}</p>
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
