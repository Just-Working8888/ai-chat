import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Текст не может быть пустым.' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY не установлен. Добавьте его в файл .env.local.' },
        { status: 500 }
      )
    }

    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    })

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: text }],
    })

    return NextResponse.json({ reply: response.choices[0].message.content })
  } catch (error: any) {
    console.error('API error:', error)

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Превышен лимит запросов. Подождите немного и попробуйте снова.' },
        { status: 429 }
      )
    }
    if (error?.status === 401 || error?.status === 403) {
      return NextResponse.json(
        { error: 'Неверный API ключ. Проверьте значение GROQ_API_KEY.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Не удалось получить ответ от ИИ. Попробуйте позже.' },
      { status: 500 }
    )
  }
}
