import { Server, Socket } from 'socket.io'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

import { WhisperService } from '../services/whisper.service'

export function registerVoiceSocket(io: Server) {
  const whisper = new WhisperService()

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id)

    socket.on(
      'audio-final',
      async (audio: ArrayBuffer | Buffer) => {
        const buffer = Buffer.isBuffer(audio)
          ? audio
          : Buffer.from(audio)

        if (buffer.length < 50000) return

        const filePath = path.join(
          '/tmp',
          `${crypto.randomUUID()}.webm`,
        )

        try {
          fs.writeFileSync(filePath, buffer)

          console.log('🎧 audio received:', buffer.length)

          const text = await whisper.transcribe(filePath)

          if (!text) return

          socket.emit('transcript', { text })
          socket.emit('ai-response', { text })

        } catch (err) {
          console.error('❌ error:', err)

          socket.emit('error', {
            message: 'transcription failed',
          })

        } finally {
          try {
            fs.unlinkSync(filePath)
          } catch {}
        }
      },
    )
  })
}