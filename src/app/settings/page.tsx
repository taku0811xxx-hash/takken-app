'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { getExamDate, saveExamDate } from '@/lib/storage'

// 宅建本試験は毎年10月の第3日曜日
function getTakkenExamDate(year: number): string {
  // 10月1日から第3日曜日を計算
  const oct1 = new Date(year, 9, 1) // 月は0始まり
  const dayOfWeek = oct1.getDay() // 0=日曜
  const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const thirdSunday = firstSunday + 14
  const d = new Date(year, 9, thirdSunday)
  return `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatExamOption(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  const days = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const label = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（第${d.getFullYear() - 1963}回）`
  if (days > 0) return `${label} — あと${days}日`
  if (days === 0) return `${label} — 今日！`
  return `${label} — 終了`
}

const CURRENT_YEAR = new Date().getFullYear()

// 現在年から5年分の選択肢を生成
const EXAM_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const year = CURRENT_YEAR + i
  const date = getTakkenExamDate(year)
  return { year, date, label: formatExamOption(date) }
})

export default function SettingsPage() {
  const [selected, setSelected] = useState(getTakkenExamDate(CURRENT_YEAR))
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExamDate().then(d => {
      // 保存済みの日付が選択肢にあれば選択状態にする
      const match = EXAM_OPTIONS.find(o => o.date === d)
      if (match) setSelected(match.date)
      else setSelected(EXAM_OPTIONS[0].date)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    await saveExamDate(selected)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <div className="flex items-center gap-3 pt-8 pb-6">
        <a href="/" className="p-2 rounded-full bg-white border border-gray-100 text-gray-400">
          <ArrowLeft size={18} />
        </a>
        <h1 className="text-xl font-bold text-gray-800">設定</h1>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">読み込み中...</p>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-700 mb-1">目標の試験回</p>
            <p className="text-xs text-gray-400 mb-3">受験する年度を選んでください</p>
            <div className="space-y-2">
              {EXAM_OPTIONS.map(opt => (
                <button
                  key={opt.date}
                  onClick={() => setSelected(opt.date)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected === opt.date
                      ? 'border-gray-800 bg-gray-800 text-white'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <p className="text-sm font-medium">{opt.year}年度 宅地建物取引士試験</p>
                  <p className={`text-xs mt-0.5 ${selected === opt.date ? 'text-gray-300' : 'text-gray-400'}`}>
                    {opt.label.split(' — ')[0]}
                    <span className={`ml-2 ${selected === opt.date ? 'text-green-400' : 'text-gray-400'}`}>
                      {opt.label.split(' — ')[1]}
                    </span>
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-amber-700 font-medium mb-1">宅建本試験について</p>
            <p className="text-xs text-amber-600 leading-relaxed">毎年10月の第3日曜日に実施されます。合格率は例年15〜17%程度です。</p>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2 transition-all ${
              saved ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            {saved ? <><Check size={18} /> 保存しました</> : '保存する'}
          </button>
        </div>
      )}
    </div>
  )
}