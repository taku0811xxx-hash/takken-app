'use client'

import { useState, useEffect } from 'react'
import wordData from '@/data/words.json'
import { getCheckedWords, getWeakWords, getDailyActivity, getStreak, DailyRecord } from '@/lib/storage'
import type { WeakWord } from '@/types'

const CATEGORIES = [
  { prefix: 'k', label: '権利関係', emoji: '⚖️', color: '#3b82f6' },
  { prefix: 't', label: '宅建業法', emoji: '🏢', color: '#22c55e' },
  { prefix: 'h', label: '法令上の制限', emoji: '📋', color: '#f97316' },
  { prefix: 'z', label: '税・その他', emoji: '💴', color: '#a855f7' },
]

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function getDayLabel(dateStr: string): string {
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return days[new Date(dateStr).getDay()]
}

export default function ProgressPage() {
  const [checkedWords, setCheckedWords] = useState<Record<string, boolean>>({})
  const [weakWords, setWeakWords] = useState<WeakWord[]>([])
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const words = wordData.words
  const wordMap = Object.fromEntries(words.map(w => [w.id, w]))

  useEffect(() => {
    Promise.all([getCheckedWords(), getWeakWords(), getDailyActivity(30), getStreak()])
      .then(([checked, weak, daily, s]) => {
        setCheckedWords(checked)
        setWeakWords(weak.slice(0, 5))
        setDailyRecords(daily)
        setStreak(s)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalChecked = Object.values(checkedWords).filter(Boolean).length
  const totalProgress = Math.round((totalChecked / words.length) * 100)

  const last7Days = getLast7Days()
  const dailyMap = Object.fromEntries(dailyRecords.map(r => [r.date, r]))

  const todayRecord = dailyMap[last7Days[6]] || { wordsChecked: 0, testAnswered: 0, testCorrect: 0 }
  const todayCorrectRate = todayRecord.testAnswered > 0
    ? Math.round((todayRecord.testCorrect / todayRecord.testAnswered) * 100)
    : null

  const categoryStats = CATEGORIES.map(cat => {
    const catWords = words.filter(w => w.id.startsWith(cat.prefix))
    const checked = catWords.filter(w => checkedWords[w.id]).length
    return { ...cat, total: catWords.length, checked, progress: Math.round(checked / catWords.length * 100) }
  })

  const maxBar = Math.max(...last7Days.map(d => (dailyMap[d]?.wordsChecked || 0) + (dailyMap[d]?.testAnswered || 0)), 1)

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-400 text-sm">読み込み中...</p></div>

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 md:pb-8">
      <div className="pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">進捗</h1>
      </div>

      {/* ストリーク + 今日のサマリー */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900 rounded-2xl p-4 text-white">
          <p className="text-xs text-gray-400 mb-1">連続学習日数</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{streak}</span>
            <span className="text-sm text-gray-400">日</span>
          </div>
          <p className="text-lg mt-1">{streak >= 7 ? '🔥🔥' : streak >= 3 ? '🔥' : '💪'}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-1">今日の学習</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-800">{todayRecord.wordsChecked}</span>
            <span className="text-sm text-gray-400">語</span>
          </div>
          {todayCorrectRate !== null ? (
            <p className="text-xs text-gray-500 mt-1">正解率 <span className="font-semibold text-gray-700">{todayCorrectRate}%</span></p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">テスト未実施</p>
          )}
        </div>
      </div>

      {/* 週間カレンダー */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">過去7日間の学習</p>
        <div className="flex gap-1.5 items-end h-24 mb-2">
          {last7Days.map(date => {
            const record = dailyMap[date]
            const total = (record?.wordsChecked || 0) + (record?.testAnswered || 0)
            const height = total > 0 ? Math.max(Math.round((total / maxBar) * 100), 8) : 0
            const isToday = date === last7Days[6]
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                  {height > 0 ? (
                    <div
                      className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-gray-800' : 'bg-gray-200'}`}
                      style={{ height: `${height}%` }}
                    />
                  ) : (
                    <div className="w-full h-1 bg-gray-100 rounded" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-1.5">
          {last7Days.map(date => {
            const isToday = date === last7Days[6]
            return (
              <div key={date} className="flex-1 text-center">
                <p className={`text-xs ${isToday ? 'font-bold text-gray-800' : 'text-gray-400'}`}>{getDayLabel(date)}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 教科別進捗 */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-4">教科別の進捗</p>
        <div className="space-y-4">
          {categoryStats.map(cat => (
            <div key={cat.prefix}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{cat.emoji}</span>
                  <span className="text-sm text-gray-700">{cat.label}</span>
                </div>
                <span className="text-xs font-semibold text-gray-600">{cat.checked}/{cat.total}語</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${cat.progress}%`, backgroundColor: cat.color }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5 text-right">{cat.progress}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* 全体進捗 */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-700">全体の理解度</p>
          <span className="text-2xl font-bold text-gray-800">{totalProgress}<span className="text-sm font-normal text-gray-400">%</span></span>
        </div>
        <div className="bg-gray-100 rounded-full h-3">
          <div className="bg-green-400 h-3 rounded-full transition-all duration-700" style={{ width: `${totalProgress}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{totalChecked} / {words.length}語 チェック済み</p>
      </div>

      {/* 苦手単語ランキング */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">苦手な単語 Top5</p>
        {weakWords.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">テストを受けると苦手分析が表示されます</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weakWords.map((w, i) => {
              const word = wordMap[w.wordId]
              if (!word) return null
              const rate = Math.round(w.correctRate * 100)
              return (
                <div key={w.wordId} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-800">{word.word}</span>
                      <span className={`text-xs font-bold ${rate < 50 ? 'text-red-500' : 'text-orange-400'}`}>{rate}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${rate < 50 ? 'bg-red-400' : 'bg-orange-400'}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
