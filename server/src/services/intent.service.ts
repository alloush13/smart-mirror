import { GoogleGenAI } from '@google/genai'

import {
  IntentSchema,
  Intent,
} from '../types/intent'

import { SMART_MIRROR_INTENTS }
from '../intents/intents'

export class IntentService {
  private ai: GoogleGenAI

  constructor() {
    const key = process.env.GEMINI_API_KEY

    if (!key) {
      throw new Error(
        'GEMINI_API_KEY missing',
      )
    }

    this.ai = new GoogleGenAI({
      apiKey: key,
    })
  }

  async parseIntent(
    text: string,
  ): Promise<Intent> {
    const intentsText =
      SMART_MIRROR_INTENTS.map(
        (intent) => `
Intent: ${intent.intent}

Description:
${intent.description}

Examples:
${intent.examples.join('\n')}
`,
      ).join('\n')

    const prompt = `
You are an AI intent parser
for a smart mirror.

Your job:
Understand the user message
and return the closest intent.

Rules:
- Return ONLY raw JSON
- No markdown
- No explanations
- Arabic and English supported

JSON schema:
{
  "intent": string,
  "reply": string
}

Available intents:

${intentsText}

User message:
${text}
`

    const response =
      await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })

    const raw =
      response.text ?? '{}'

    console.log(
      '🤖 RAW GEMINI:',
      raw,
    )

    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let parsed: unknown

    try {
      parsed = JSON.parse(cleaned)
    } catch (error) {
      console.error(
        '❌ JSON parse error:',
        cleaned,
      )

      return {
        intent: 'UNKNOWN',
        reply:
          'لم أفهم الطلب',
      }
    }

    return IntentSchema.parse(parsed)
  }
}