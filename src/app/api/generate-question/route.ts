import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { word, explanation } = await req.json()

  const prompt = `宅建試験の勉強をしている人向けに、以下の単語に関する4択問題を1問作ってください。

単語: ${word}
解説: ${explanation}

以下のJSON形式で返してください（他のテキストは一切不要）:
{
  "question": "問題文",
  "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  "answer": 0,
  "explanation": "正解の理由を2〜3文で"
}

条件:
- answerは正解の選択肢のインデックス（0〜3）
- 実際の宅建試験に出そうな実践的な問題にする
- 選択肢は紛らわしいものを含め、考えさせる内容にする
- 問題文は「次の記述のうち、正しいものはどれか」形式にしない。具体的な状況問題にする`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const json = JSON.parse(text.replace(/```json|```/g, '').trim())

    return NextResponse.json(json)
  } catch (e) {
    return NextResponse.json({ error: '問題の生成に失敗しました' }, { status: 500 })
  }
}
