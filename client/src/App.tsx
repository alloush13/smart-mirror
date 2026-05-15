import { useEffect, useState } from 'react'

import { socket } from './socket'

import { useRealtimeMic }
from './hooks/useRealtimeMic'

import { speak }
from './utils/tts'

import Mirror from './components/Mirror'

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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 gap-8">
      {/* Mirror Component */}
      <div className="w-full h-screen max-h-screen flex items-center justify-center">
        <Mirror
          isListening={isListening}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-gray-700 p-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold">
            Smart Mirror
          </h1>
          <p className="text-sm text-gray-400">
            {isSpeaking
              ? '🔊 Speaking...'
              : isListening
                ? '🎤 Listening...'
                : '⏸️ Ready'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {isConnected
              ? '✓ Connected'
              : '✗ Disconnected'}
          </p>
        </div>
      </div>
    </div>
  )
}