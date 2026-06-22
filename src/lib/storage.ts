import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore'
import { db, auth } from './firebase'
import type { CheckedWords, TestResult, WeakWord } from '@/types'

function getUserId(): string {
  return auth.currentUser?.uid ?? 'anonymous'
}

function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export async function getCheckedWords(): Promise<CheckedWords> {
  const ref = doc(db, 'users', getUserId(), 'progress', 'checked')
  const snap = await withTimeout(getDoc(ref))
  return snap.exists() ? (snap.data() as CheckedWords) : {}
}

export async function saveCheckedWords(checked: CheckedWords, prevChecked: CheckedWords): Promise<void> {
  const ref = doc(db, 'users', getUserId(), 'progress', 'checked')
  await setDoc(ref, checked)

  // 今日チェックした数を記録
  const newlyChecked = Object.keys(checked).filter(id => checked[id] && !prevChecked[id]).length
  if (newlyChecked > 0) await recordDailyActivity({ wordsChecked: newlyChecked })
}

export async function saveTestResult(result: TestResult): Promise<void> {
  const ref = collection(db, 'users', getUserId(), 'testResults')
  await addDoc(ref, result)
  await recordDailyActivity({ testAnswered: 1, testCorrect: result.correct ? 1 : 0 })
}

// 日次学習記録
type DailyActivity = {
  wordsChecked?: number
  testAnswered?: number
  testCorrect?: number
}

export async function recordDailyActivity(activity: DailyActivity): Promise<void> {
  try {
    const today = todayStr()
    const ref = doc(db, 'users', getUserId(), 'dailyActivity', today)
    const snap = await getDoc(ref)
    const current = snap.exists() ? snap.data() : { date: today, wordsChecked: 0, testAnswered: 0, testCorrect: 0 }
    await setDoc(ref, {
      date: today,
      wordsChecked: (current.wordsChecked || 0) + (activity.wordsChecked || 0),
      testAnswered: (current.testAnswered || 0) + (activity.testAnswered || 0),
      testCorrect: (current.testCorrect || 0) + (activity.testCorrect || 0),
    })
  } catch {}
}

export type DailyRecord = {
  date: string
  wordsChecked: number
  testAnswered: number
  testCorrect: number
}

export async function getDailyActivity(days = 30): Promise<DailyRecord[]> {
  try {
    const ref = collection(db, 'users', getUserId(), 'dailyActivity')
    const snap = await withTimeout(getDocs(ref))
    return snap.docs.map(d => d.data() as DailyRecord).sort((a, b) => a.date.localeCompare(b.date)).slice(-days)
  } catch { return [] }
}

export async function getStreak(): Promise<number> {
  try {
    const records = await getDailyActivity(60)
    const dateSet = new Set(records.filter(r => r.wordsChecked > 0 || r.testAnswered > 0).map(r => r.date))
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 60; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const str = d.toISOString().split('T')[0]
      if (dateSet.has(str)) streak++
      else if (i > 0) break
    }
    return streak
  } catch { return 0 }
}

export async function getWeakWords(): Promise<WeakWord[]> {
  const ref = collection(db, 'users', getUserId(), 'testResults')
  const q = query(ref, orderBy('timestamp', 'desc'))
  const snap = await withTimeout(getDocs(q))
  const results: TestResult[] = snap.docs.map(d => d.data() as TestResult)
  const stats: Record<string, { correct: number; total: number }> = {}
  results.forEach(r => {
    if (!stats[r.wordId]) stats[r.wordId] = { correct: 0, total: 0 }
    stats[r.wordId].total++
    if (r.correct) stats[r.wordId].correct++
  })
  return Object.entries(stats)
    .map(([wordId, s]) => ({ wordId, correctRate: s.correct / s.total, attempts: s.total }))
    .filter(w => w.attempts >= 2)
    .sort((a, b) => a.correctRate - b.correctRate)
}

function getDefaultExamDate(): string {
  const year = new Date().getFullYear()
  const oct1 = new Date(year, 9, 1)
  const dayOfWeek = oct1.getDay()
  const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const thirdSunday = firstSunday + 14
  const d = new Date(year, 9, thirdSunday)
  return `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function getExamDate(): Promise<string> {
  const defaultDate = getDefaultExamDate()
  try {
    const ref = doc(db, 'users', getUserId(), 'settings', 'exam')
    const snap = await withTimeout(getDoc(ref))
    return snap.exists() ? snap.data().date : defaultDate
  } catch {
    return localStorage.getItem('examDate') || defaultDate
  }
}

export async function saveExamDate(date: string): Promise<void> {
  try {
    const ref = doc(db, 'users', getUserId(), 'settings', 'exam')
    await setDoc(ref, { date })
  } catch {
    localStorage.setItem('examDate', date)
  }
}
