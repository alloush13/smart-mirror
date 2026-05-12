import { useRef, useState } from 'react'
import { socket } from '../socket'

export function useRealtimeMic() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    const recorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm',
    })

    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, {
        type: 'audio/webm',
      })

      chunksRef.current = []

      const arrayBuffer = await blob.arrayBuffer()

      socket.emit('audio-final', arrayBuffer)
    }

    recorder.start()

    mediaRecorderRef.current = recorder
    setIsRecording(true)
  }

  const stop = () => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream
      .getTracks()
      .forEach((t) => t.stop())

    setIsRecording(false)
  }

  return { start, stop, isRecording }
}