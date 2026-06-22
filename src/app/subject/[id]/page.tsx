'use client'

import { useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, CheckCircle } from 'lucide-react'
import curriculumData from '@/data/curriculum.json'
import wordData from '@/data/words.json'
import { getCheckedWords } from '@/lib/storage'
import type { CheckedWords } from '@/types'

const SUBJECT_COLORS: Record<string, { bg: string; bar: string }> = {
  k: { bg: 'bg-blue-50 border-blue-100', bar: '#3b82f6' },
  t: { bg: 'bg-green-50 border-green-100', bar: '#22c55e' },
  h: { bg: 'bg-orange-50 border-orange-100', bar: '#f97316' },
  z: { bg: 'bg-purple-50 border-purple-100', bar: '#a855f7' },
}

export default function SubjectPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [checked, setChecked] = useState<CheckedWords>({})
  const [loading, setLoading] = useState(true)

  const subject = curriculumData.subjects.find(s => s.id === id)
  const color = SUBJECT_COLORS[id] || SUBJECT_COLORS.k

  useEffect(() => {
    getCheckedWords().then(setChecked).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const unitStats = useMemo(() => {
    if (!subject) return []
    return subject.units.map(unit => {
      const total = unit.wordIds.length
      const done = unit.wordIds.filter(wid => checked[wid]).length
      return { ...unit, total, done, progress: total > 0 ? Math.round(done / total * 100) : 0 }
    })
  }, [subject, checked])

  const totalWords = unitStats.reduce((s, u) => s + u.total, 0)
  const totalDone = unitStats.reduce((s, u) => s + u.done, 0)
  const totalProgress = totalWords > 0 ? Math.round(totalDone / totalWords * 100) : 0

  if (!subject) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-400 text-sm">教科が見つかりません</p></div>

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 md:pb-8">
      <div className="flex items-center gap-3 pt-8 pb-4">
        <Link href="/" className="p-2 rounded-full bg-white border border-gray-100 text-gray-400">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">{subject.emoji} {subject.label}</h1>
      </div>

      <div className={`${color.bg} border rounded-2xl p-4 mb-4`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">この教科の進捗</span>
          <span className="text-sm font-semibold text-gray-700">{totalDone}/{totalWords}語</span>
        </div>
        <div className="bg-white bg-opacity-60 rounded-full h-2 mb-3">
          <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${totalProgress}%`, backgroundColor: color.bar }} />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{subject.overview}</p>
        <div className="mt-3 bg-white bg-opacity-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-600 mb-1">💡 学習のコツ</p>
          <p className="text-xs text-gray-600 leading-relaxed">{subject.studyTip}</p>
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-400 mb-3">単元を選んで学習する</p>
      <div className="space-y-3">
        {unitStats.map((unit, i) => (
          <Link
            key={unit.id}
            href={`/subject/${id}/unit/${unit.id}`}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 active:opacity-80 block"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${unit.progress === 100 ? 'bg-green-100' : 'bg-gray-100'}`}>
              {unit.progress === 100
                ? <CheckCircle size={18} className="text-green-500" />
                : <span className="text-sm font-bold text-gray-500">{i + 1}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-800">{unit.title}</p>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{unit.done}/{unit.total}語</span>
              </div>
              <div className="bg-gray-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${unit.progress}%`, backgroundColor: color.bar }} />
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">{unit.overview.substring(0, 40)}...</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
