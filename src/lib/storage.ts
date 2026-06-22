import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from './firebase'
import type { CheckedWords, TestResult, WeakWord } from '@/types'

const USER_ID = 'mom' // お母さん専用なのでシンプルに固定

// チェック状態の取得
export async function getCheckedWords(): Promise<CheckedWords> {
  const ref = doc(db, 'users', USER_ID, 'progress', 'checked')
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as CheckedWords) : {}
}

// チェック状態の保存
export async function saveCheckedWords(checked: CheckedWords): Promise<void> {
  const ref = doc(db, 'users', USER_ID, 'progress', 'checked')
  await setDoc(ref, checked)
}

// テスト結果の保存
export async function saveTestResult(result: TestResult): Promise<void> {
  const ref = collection(db, 'users', USER_ID, 'testResults')
  await addDoc(ref, result)
}

// 苦手単語の計算
export async function getWeakWords(): Promise<WeakWord[]> {
  const ref = collection(db, 'users', USER_ID, 'testResults')
  const q = query(ref, orderBy('timestamp', 'desc'))
  const snap = await getDocs(q)

  const results: TestResult[] = snap.docs.map(d => d.data() as TestResult)

  // 単語ごとに集計
  const stats: Record<string, { correct: number; total: number }> = {}
  results.forEach(r => {
    if (!stats[r.wordId]) stats[r.wordId] = { correct: 0, total: 0 }
    stats[r.wordId].total++
    if (r.correct) stats[r.wordId].correct++
  })

  return Object.entries(stats)
    .map(([wordId, s]) => ({
      wordId,
      correctRate: s.correct / s.total,
      attempts: s.total,
    }))
    .filter(w => w.attempts >= 2) // 2回以上解いた単語だけ対象
    .sort((a, b) => a.correctRate - b.correctRate) // 正解率が低い順
}
