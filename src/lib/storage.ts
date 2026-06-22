import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from './firebase'
import type { CheckedWords, TestResult, WeakWord } from '@/types'

const USER_ID = 'mom'

function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

export async function getCheckedWords(): Promise<CheckedWords> {
  const ref = doc(db, 'users', USER_ID, 'progress', 'checked')
  const snap = await withTimeout(getDoc(ref))
  return snap.exists() ? (snap.data() as CheckedWords) : {}
}

export async function saveCheckedWords(checked: CheckedWords): Promise<void> {
  const ref = doc(db, 'users', USER_ID, 'progress', 'checked')
  await setDoc(ref, checked)
}

export async function saveTestResult(result: TestResult): Promise<void> {
  const ref = collection(db, 'users', USER_ID, 'testResults')
  await addDoc(ref, result)
}

export async function getWeakWords(): Promise<WeakWord[]> {
  const ref = collection(db, 'users', USER_ID, 'testResults')
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
    const ref = doc(db, 'users', USER_ID, 'settings', 'exam')
    const snap = await withTimeout(getDoc(ref))
    return snap.exists() ? snap.data().date : defaultDate
  } catch {
    return localStorage.getItem('examDate') || defaultDate
  }
}

export async function saveExamDate(date: string): Promise<void> {
  try {
    const ref = doc(db, 'users', USER_ID, 'settings', 'exam')
    await setDoc(ref, { date })
  } catch {
    localStorage.setItem('examDate', date)
  }
}