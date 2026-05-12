import { useEffect, useState } from 'react'

import { socket } from './socket'

import { useRealtimeMic }
from './hooks/useRealtimeMic'

import { speak }
from './utils/tts'

interface Response {
  type:
    | 'transcript'
    | 'ai-response'
    | 'error'

  text: string

  intent?: string
}

export default function App() {
  const {
    isListening,
    isSpeaking,

    pauseListening,
    resumeListening,
  } = useRealtimeMic()

  const [responses, setResponses] =
    useState<Response[]>([])

  const [isConnected, setIsConnected] =
    useState(false)

  useEffect(() => {
    speechSynthesis.getVoices()

    const handleConnect = () => {
      setIsConnected(true)

      console.log('✓ Connected')
    }

    const handleDisconnect = () => {
      setIsConnected(false)

      console.log('✗ Disconnected')
    }

    const handleTranscript = (
      data: { text: string },
    ) => {
      setResponses((prev) => [
        {
          type: 'transcript',
          text: data.text,
        },
        ...prev,
      ])
    }

    const handleAiResponse = (
      data: {
        intent: string
        reply: string
      },
    ) => {
      console.log(
        '🤖 AI RESPONSE:',
        data,
      )

      // 🔊 speak with mic pause
      speak(
        data.reply,

        () => {
          pauseListening()
        },

        () => {
          resumeListening()
        },
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

    const handleError = (
      data: {
        message: string
      },
    ) => {
      console.error(
        '❌ SOCKET ERROR:',
        data,
      )

      setResponses((prev) => [
        {
          type: 'error',
          text: data.message,
        },
        ...prev,
      ])
    }

    socket.on(
      'connect',
      handleConnect,
    )

    socket.on(
      'disconnect',
      handleDisconnect,
    )

    socket.on(
      'transcript',
      handleTranscript,
    )

    socket.on(
      'ai-response',
      handleAiResponse,
    )

    socket.on(
      'error',
      handleError,
    )

    return () => {
      socket.off(
        'connect',
        handleConnect,
      )

      socket.off(
        'disconnect',
        handleDisconnect,
      )

      socket.off(
        'transcript',
        handleTranscript,
      )

      socket.off(
        'ai-response',
        handleAiResponse,
      )

      socket.off(
        'error',
        handleError,
      )
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div
          className={`w-40 h-40 rounded-full flex items-center justify-center text-6xl transition-all duration-300 ${
            isSpeaking
              ? 'bg-green-500 scale-110'
              : isListening
                ? 'bg-blue-500 animate-pulse'
                : 'bg-gray-600'
          }`}
        >
          🎤
        </div>

        <h1 className="text-4xl font-bold mt-8">
          Smart Mirror
        </h1>

        <p className="text-gray-400 mt-4">
          {isSpeaking
            ? 'Listening to user'
            : isListening
              ? 'Waiting for speech'
              : 'Inactive'}
        </p>
      </div>
    </div>
  )
}