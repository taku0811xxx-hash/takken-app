export type Word = {
  id: string
  word: string
  subcategory: string
  difficulty: 1 | 2 | 3 | 4 | 5
  explanation: string
  point: string
  related: string[]
}

export type WordData = {
  version: string
  category: string
  words: Word[]
}

export type CheckedWords = Record<string, boolean>

export type TestResult = {
  wordId: string
  correct: boolean
  timestamp: number
}

export type WeakWord = {
  wordId: string
  correctRate: number
  attempts: number
}
