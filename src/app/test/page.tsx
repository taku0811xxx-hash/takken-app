'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Brain, CheckSquare, ChevronRight } from 'lucide-react'
import wordData from '@/data/words.json'
import questionsData from '@/data/questions.json'
import { getWeakWords, saveTestResult } from '@/lib/storage'

type Question = {
  question: string
  options: string[]
  answer: number
  explanation: string
}

type Phase = 'select' | 'answering' | 'done'

export default function TestPage() {
  const [phase, setPhase] = useState<Phase>('select')
  const [mode, setMode] = useState<'random' | 'weak'>('random')
  const [currentWord, setCurrentWord] = useState<typeof wordData.words[0] | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [weakWordIds, setWeakWordIds] = useState<string[]>([])

  const words = wordData.words
  const questions = questionsData as Record<string, Question[]>

  useEffect(() => {
    getWeakWords()
      .then(weak => setWeakWordIds(weak.slice(0, 10).map(w => w.wordId)))
      .catch(() => {})
  }, [])

  const pickQuestion = () => {
    let pool = words.filter(w => questions[w.id]?.length > 0)
    if (mode === 'weak' && weakWordIds.length > 0) {
      const weakPool = pool.filter(w => weakWordIds.includes(w.id))
      if (weakPool.length > 0) pool = weakPool
    }
    const word = pool[Math.floor(Math.random() * pool.length)]
    const wordQuestions = questions[word.id]
    const q = wordQuestions[Math.floor(Math.random() * wordQuestions.length)]
    return { word, q }
  }

  const startQuestion = () => {
    const { word, q } = pickQuestion()
    setCurrentWord(word)
    setQuestion(q)
    setSelected(null)
    setPhase('answering')
  }

  const handleAnswer = async (idx: number) => {
    if (selected !== null || !question || !currentWord) return
    setSelected(idx)
    const correct = idx === question.answer
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    try {
      await saveTestResult({ wordId: currentWord.id, correct, timestamp: Date.now() })
    } catch {}
  }

  const availableCount = words.filter(w => questions[w.id]?.length > 0).length

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <div className="pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">テスト</h1>
        <p className="text-sm text-gray-400 mt-1">
          今日の正解率: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : '--'}% ({score.correct}/{score.total}問)
        </p>
      </div>

      {phase === 'select' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">出題モードを選んでください</p>
            <div className="space-y-2">
              <button
                onClick={() => setMode('random')}
                className={`w-full p-3 rounded-xl text-left text-sm transition-all border ${mode === 'random' ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 text-gray-700'}`}
              >
                <p className="font-medium">ランダム出題</p>
                <p className={`text-xs mt-0.5 ${mode === 'random' ? 'text-gray-300' : 'text-gray-400'}`}>{availableCount}語・{Object.values(questions).reduce((s, q) => s + q.length, 0)}問から出題</p>
              </button>
              <button
                onClick={() => setMode('weak')}
                className={`w-full p-3 rounded-xl text-left text-sm transition-all border ${mode === 'weak' ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 text-gray-700'}`}
              >
                <p className="font-medium">苦手集中</p>
                <p className={`text-xs mt-0.5 ${mode === 'weak' ? 'text-gray-300' : 'text-gray-400'}`}>
                  {weakWordIds.length > 0 ? `苦手な${weakWordIds.length}語を重点出題` : 'テストを受けると苦手が分析されます'}
                </p>
              </button>
            </div>
          </div>

          <button
            onClick={startQuestion}
            className="w-full bg-gray-800 text-white py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2"
          >
            <Brain size={20} />
            問題を始める
          </button>
        </div>
      )}

      {phase === 'answering' && question && currentWord && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-2">{currentWord.subcategory} / 難易度{'★'.repeat(currentWord.difficulty)}</p>
            <p className="text-base font-medium text-gray-800 leading-relaxed">{question.question}</p>
          </div>

          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              let style = 'bg-white border-gray-100 text-gray-700'
              if (selected !== null) {
                if (idx === question.answer) style = 'bg-green-50 border-green-300 text-green-800'
                else if (idx === selected) style = 'bg-red-50 border-red-300 text-red-800'
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selected !== null}
                  className={`w-full p-4 rounded-2xl text-left text-sm border transition-all ${style}`}
                >
                  <span className="font-medium mr-2">{['A', 'B', 'C', 'D'][idx]}.</span>
                  {opt}
                </button>
              )
            })}
          </div>

          {selected !== null && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-xs font-semibold text-amber-700 mb-1">
                {selected === question.answer ? '✅ 正解！' : '❌ 不正解'}
              </p>
              <p className="text-sm text-amber-800 leading-relaxed">{question.explanation}</p>
            </div>
          )}

          {selected !== null && (
            <button
              onClick={startQuestion}
              className="w-full bg-gray-800 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2"
            >
              次の問題へ <ChevronRight size={18} />
            </button>
          )}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex">
        <a href="/" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <span className="text-lg">🏠</span><span className="text-xs">ホーム</span>
        </a>
        <a href="/words" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <span className="text-lg">📖</span><span className="text-xs">単語帳</span>
        </a>
        <a href="/test" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-800">
          <span className="text-lg">🧠</span><span className="text-xs font-medium">テスト</span>
        </a>
        <a href="/progress" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400">
          <span className="text-lg">📊</span><span className="text-xs">進捗</span>
        </a>
      </nav>
    </div>
  )
}
