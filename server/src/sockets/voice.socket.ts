import { Server, Socket } from 'socket.io'

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

import { WhisperService }
from '../services/whisper.service'

import { IntentService }
from '../services/intent.service'

import { executeIntent }
from '../intents/intent.executor'

export function registerVoiceSocket(
  io: Server,
): void {
  const whisper =
    new WhisperService()

  const intentService =
    new IntentService()

  io.on(
    'connection',
    (socket: Socket) => {
      console.log(
        'Client connected:',
        socket.id,
      )

      socket.on(
        'audio-final',
        async (audio: ArrayBuffer) => {
          const tempDir =
            path.resolve('/tmp')

          if (
            !fs.existsSync(tempDir)
          ) {
            fs.mkdirSync(tempDir, {
              recursive: true,
            })
          }

          const filePath =
            path.join(
              tempDir,
              `${crypto.randomUUID()}.webm`,
            )

          try {
            const buffer =
              Buffer.from(audio)

            fs.writeFileSync(
              filePath,
              buffer,
            )

            console.log(
              '🎧 audio received:',
              buffer.length,
            )

            // 🎤 Whisper
            const text =
              await whisper.transcribe(
                filePath,
              )

            if (
              !text ||
              !text.trim()
            ) {
              return
            }

            console.log(
              '🧠 transcript:',
              text,
            )

            socket.emit(
              'transcript',
              {
                text,
              },
            )

            // 🤖 Gemini Intent
            const result =
              await intentService.parseIntent(
                text,
              )

            console.log(
              '⚡ intent:',
              result.intent,
            )

            // ⚙️ Execute action
            await executeIntent(
              result.intent,
            )

            // 📡 Send to frontend
            socket.emit(
              'ai-response',
              {
                intent:
                  result.intent,

                reply:
                  result.reply,
              },
            )
          } catch (error) {
            console.error(
              '❌ error:',
              error,
            )

            socket.emit(
              'error',
              {
                message:
                  'Audio processing failed',
              },
            )
          } finally {
            try {
              fs.unlinkSync(filePath)
            } catch {}
          }
        },
      )
    },
  )
}