import fs from 'node:fs'

export class WhisperService {
  async transcribe(filePath: string): Promise<string> {
    const form = new FormData()

    form.append(
      'file',
      new Blob([fs.readFileSync(filePath)]),
      'audio.webm',
    )

    const whisperUrl =
      process.env.WHISPER_URL ??
      'http://localhost:8000/transcribe'

    const res = await fetch(whisperUrl, {
      method: 'POST',
      body: form,
    })

    if (!res.ok) {
      const errorBody = await res.text()

      throw new Error(
        `whisper failed (${res.status} ${res.statusText}): ${errorBody}`,
      )
    }

    const data = (await res.json()) as {
      text?: unknown
    }

    if (typeof data.text !== 'string') {
      throw new Error('whisper response missing text')
    }

    return data.text
  }
}