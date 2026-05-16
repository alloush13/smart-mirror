import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { createAudioStream } from '../services/audio/stream'
import { createRecorder } from '../services/audio/mediaRecorder'
import { createAudioAnalyser } from '../services/audio/audioContext'
import {
  calculateRMS,
  isSpeech,
} from '../services/audio/vad'
import { sendAudio } from '../sockets/audioSocket'

const THRESHOLD = 0.02
const SILENCE_DELAY = 1200

export function useRealtimeMic(enabled = true) {
  const runningRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const recorderRef =
    useRef<MediaRecorder | null>(null)

  const streamRef =
    useRef<MediaStream | null>(null)

  const analyserRef =
    useRef<AnalyserNode | null>(null)

  const audioContextRef =
    useRef<AudioContext | null>(null)

  const chunksRef =
    useRef<Blob[]>([])

  const silenceTimer =
    useRef<number | null>(null)

  const isSpeakingRef =
    useRef(false)

  const isAssistantSpeakingRef =
    useRef(false)

  const [isListening, setIsListening] =
    useState(false)

  const [isSpeaking, setIsSpeaking] =
    useState(false)

const cleanup = useCallback(() => {
  runningRef.current = false

  if (rafRef.current) {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  if (silenceTimer.current) {
    clearTimeout(silenceTimer.current)
    silenceTimer.current = null
  }

  recorderRef.current?.stop()

  streamRef.current?.getTracks().forEach((t) => t.stop())

  audioContextRef.current?.close()

  recorderRef.current = null
  streamRef.current = null
  analyserRef.current = null
  audioContextRef.current = null

  isSpeakingRef.current = false
  isAssistantSpeakingRef.current = false

  chunksRef.current = []
}, [])

const start = useCallback(async () => {
  await cleanup()

  const stream = await createAudioStream()
  streamRef.current = stream

  const recorder = createRecorder(stream, (chunk) => {
    chunksRef.current.push(chunk)
  })

  recorderRef.current = recorder
  recorder.start()

  const { audioContext, analyser } = createAudioAnalyser(stream)

  audioContextRef.current = audioContext
  analyserRef.current = analyser

  setIsListening(true)

  runningRef.current = true
  detect()
}, [cleanup])


const detect = useCallback(() => {
  const analyser = analyserRef.current
  if (!analyser) return

  const data = new Uint8Array(analyser.fftSize)

  const loop = () => {
    if (!runningRef.current) return

    if (isAssistantSpeakingRef.current) {
      rafRef.current = requestAnimationFrame(loop)
      return
    }

    analyser.getByteTimeDomainData(data)

    const rms = calculateRMS(data)

    if (isSpeech(rms, THRESHOLD)) {
      isSpeakingRef.current = true
      setIsSpeaking(true)

      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current)
        silenceTimer.current = null
      }
    } else {
      if (isSpeakingRef.current && !silenceTimer.current) {
        silenceTimer.current = window.setTimeout(async () => {
          if (!runningRef.current) return

          isSpeakingRef.current = false
          setIsSpeaking(false)

          const blob = new Blob(chunksRef.current, {
            type: 'audio/webm',
          })

          chunksRef.current = []

          await sendAudio(blob)

          recorderRef.current?.stop()

          // إعادة تشغيل آمنة
          if (runningRef.current && streamRef.current) {
            const newRecorder = createRecorder(
              streamRef.current,
              (chunk) => chunksRef.current.push(chunk)
            )

            recorderRef.current = newRecorder
            newRecorder.start()
          }
        }, SILENCE_DELAY)
      }
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  loop()
}, [])

  // ⏸ pause mic (AI speaking)
  const pauseListening = useCallback(() => {
    isAssistantSpeakingRef.current = true
  }, [])

  // ▶ resume mic
  const resumeListening = useCallback(() => {
    isAssistantSpeakingRef.current = false
    chunksRef.current = []
  }, [])

  useEffect(() => {
    if (enabled) start()
    else cleanup()

    return cleanup
  }, [enabled, start, cleanup])

  return {
    isListening,
    isSpeaking,
    pauseListening,
    resumeListening,
  }
}