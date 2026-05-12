import { useRef, useState } from 'react'
import { socket } from '../socket'

export function useRealtimeMic() {
  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  const start = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        })

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      recorder.ondataavailable = async (event) => {
        if (event.data.size <= 0) {
          return
        }

        const arrayBuffer =
          await event.data.arrayBuffer()

        socket.emit('audio-chunk', arrayBuffer)
      }

      recorder.start(500)
      setIsRecording(true)

      mediaRecorderRef.current = recorder
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => {
        track.stop()
      })
    }
  }

  return {
    start,
    stop,
    isRecording,
  }
}