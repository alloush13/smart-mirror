import fs from 'node:fs'

export class WhisperService {
  async transcribe(filePath: string): Promise<string> {
    const form = new FormData()

    form.append(
      'file',
      new Blob([fs.readFileSync(filePath)]),
      'audio.webm',
    )

    const res = await fetch(
      'http://localhost:8000/transcribe',
      {
        method: 'POST',
        body: form,
      },
    )

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'whisper failed')
    }

    return data.text
  }
}