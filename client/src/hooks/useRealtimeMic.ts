import { useEffect, useRef, useState } from 'react'

import { socket } from '../socket'

const SILENCE_THRESHOLD = 0.02

const SILENCE_DELAY = 1200

const MIN_SPEECH_DURATION = 2000

const MIN_BLOB_SIZE = 10000

export function useRealtimeMic() {
  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null)

  const audioContextRef =
    useRef<AudioContext | null>(null)

  const analyserRef =
    useRef<AnalyserNode | null>(null)

  const chunksRef =
    useRef<Blob[]>([])

  const silenceTimeoutRef =
    useRef<number | null>(null)

  const animationFrameRef =
    useRef<number | null>(null)

  const isSpeakingRef =
    useRef(false)

  // 🤖 assistant speaking
  const isAssistantSpeakingRef =
    useRef(false)

  const speechStartedAtRef =
    useRef(0)

  const [isListening, setIsListening] =
    useState(false)

  const [isSpeaking, setIsSpeaking] =
    useState(false)

  useEffect(() => {
    void setup()

    return () => {
      cleanup()
    }
  }, [])

  const setup = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, {
            type: 'audio/webm',
          })

          chunksRef.current = []

          const speechDuration =
            Date.now() -
            speechStartedAtRef.current

          console.log(
            '🗣 speech duration:',
            speechDuration,
          )

          console.log(
            '📦 blob size:',
            blob.size,
          )

          // ❌ ignore short audio
          if (
            speechDuration <
              MIN_SPEECH_DURATION ||
            blob.size < MIN_BLOB_SIZE
          ) {
            console.log(
              '⚠️ ignored short speech',
            )

            recorder.start()

            return
          }

          const arrayBuffer =
            await blob.arrayBuffer()

          socket.emit(
            'audio-final',
            arrayBuffer,
          )

          console.log('📡 audio sent')

          recorder.start()
        } catch (error) {
          console.error(
            '❌ recorder error:',
            error,
          )

          try {
            recorder.start()
          } catch {}
        }
      }

      recorder.start()

      mediaRecorderRef.current = recorder

      // 🔊 AudioContext
      const audioContext =
        new AudioContext()

      const source =
        audioContext.createMediaStreamSource(
          stream,
        )

      const analyser =
        audioContext.createAnalyser()

      analyser.fftSize = 2048

      source.connect(analyser)

      analyserRef.current = analyser

      audioContextRef.current =
        audioContext

      setIsListening(true)

      detectVoice()
    } catch (error) {
      console.error(
        '❌ microphone setup failed:',
        error,
      )
    }
  }

  const detectVoice = () => {
    const analyser =
      analyserRef.current

    if (!analyser) {
      return
    }

    const data =
      new Uint8Array(
        analyser.fftSize,
      )

    const check = () => {
      // 🛑 pause listening while assistant speaking
      if (
        isAssistantSpeakingRef.current
      ) {
        animationFrameRef.current =
          requestAnimationFrame(check)

        return
      }

      analyser.getByteTimeDomainData(data)

      let sum = 0

      for (
        let i = 0;
        i < data.length;
        i++
      ) {
        const normalized =
          (data[i] - 128) / 128

        sum +=
          normalized * normalized
      }

      const rms = Math.sqrt(
        sum / data.length,
      )

      // 🗣 user speaking
      if (rms > SILENCE_THRESHOLD) {
        if (!isSpeakingRef.current) {
          console.log(
            '🟢 speech started',
          )

          speechStartedAtRef.current =
            Date.now()
        }

        isSpeakingRef.current = true

        setIsSpeaking(true)

        if (
          silenceTimeoutRef.current
        ) {
          clearTimeout(
            silenceTimeoutRef.current,
          )

          silenceTimeoutRef.current =
            null
        }
      }

      // 🤫 silence
      else {
        if (
          isSpeakingRef.current &&
          !silenceTimeoutRef.current
        ) {
          silenceTimeoutRef.current =
            window.setTimeout(() => {
              console.log(
                '🔴 speech ended',
              )

              isSpeakingRef.current =
                false

              setIsSpeaking(false)

              if (
                mediaRecorderRef.current &&
                mediaRecorderRef.current
                  .state ===
                  'recording'
              ) {
                mediaRecorderRef.current.stop()
              }
            }, SILENCE_DELAY)
        }
      }

      animationFrameRef.current =
        requestAnimationFrame(check)
    }

    check()
  }

  // 🛑 pause mic
  const pauseListening = () => {
    console.log(
      '⏸ listening paused',
    )

    isAssistantSpeakingRef.current =
      true
  }

  // ▶️ resume mic
  const resumeListening = () => {
    console.log(
      '▶️ listening resumed',
    )

    isAssistantSpeakingRef.current =
      false
    chunksRef.current = []
  }

  const cleanup = () => {
    if (
      silenceTimeoutRef.current
    ) {
      clearTimeout(
        silenceTimeoutRef.current,
      )
    }

    if (
      animationFrameRef.current
    ) {
      cancelAnimationFrame(
        animationFrameRef.current,
      )
    }

    mediaRecorderRef.current?.stop()

    mediaRecorderRef.current?.stream
      .getTracks()
      .forEach((track) => {
        track.stop()
      })

    audioContextRef.current?.close()
  }

  return {
    isListening,
    isSpeaking,

    pauseListening,
    resumeListening,
  }
}