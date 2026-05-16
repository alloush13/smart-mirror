import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { socket } from '../socket'
import { speak } from '../utils/tts'
import { useRealtimeMic } from './useRealtimeMic'

export interface VoiceResponse {
  type: 'transcript' | 'ai-response' | 'error'
  text: string
  intent?: string
}

export function useSmartMirrorSession() {
  const [isMirrorActive, setIsMirrorActive] =
    useState(false)

  const [isConnected, setIsConnected] =
    useState(false)

  const [responses, setResponses] =
    useState<VoiceResponse[]>([])

  const {
    isListening,
    isSpeaking,
    pauseListening,
    resumeListening,
  } = useRealtimeMic(true)

  useEffect(() => {
    const handleConnect = () =>
      setIsConnected(true)

    const handleDisconnect = () =>
      setIsConnected(false)

    const handleTranscript = (data: {
      text: string
    }) => {
      setResponses((prev) => [
        {
          type: 'transcript',
          text: data.text,
        },
        ...prev,
      ])
    }

    const handleAiResponse = (data: {
      intent: string
      reply: string
    }) => {
      if (data.intent === 'TURN_ON_SCREEN') {
        setIsMirrorActive(true)
      }

      if (data.intent === 'TURN_OFF_SCREEN') {
        setIsMirrorActive(false)
      }

      speak(
        data.reply,
        pauseListening,
        resumeListening,
      )

      setResponses((prev) => [
        {
          type: 'ai-response',
          text: data.reply,
          intent: data.intent,
        },
        ...prev,
      ])
    }

    const handleError = (data: {
      message: string
    }) => {
      setResponses((prev) => [
        {
          type: 'error',
          text: data.message,
        },
        ...prev,
      ])
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('transcript', handleTranscript)
    socket.on('ai-response', handleAiResponse)
    socket.on('error', handleError)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('transcript', handleTranscript)
      socket.off('ai-response', handleAiResponse)
      socket.off('error', handleError)
    }
  }, [pauseListening, resumeListening])

  const turnOn = useCallback(
    () => setIsMirrorActive(true),
    [],
  )

  const turnOff = useCallback(
    () => setIsMirrorActive(false),
    [],
  )

  const toggleMirror = useCallback(
    () => setIsMirrorActive((p) => !p),
    [],
  )

  const toggleListening = useCallback(() => {
    if (isListening) pauseListening()
    else resumeListening()
  }, [isListening, pauseListening, resumeListening])

  return {
    isMirrorActive,
    isConnected,
    isListening,
    isSpeaking,
    responses,

    turnOn,
    turnOff,
    toggleMirror,
    toggleListening,
  }
}