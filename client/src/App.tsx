import { useState, useEffect } from 'react'
import { socket } from './socket'
import { useRealtimeMic } from './hooks/useRealtimeMic'

interface Response {
  type: 'transcript' | 'ai-response' | 'error'
  text: string
  intent?: string
}

export default function App() {
  const { start, stop, isRecording } = useRealtimeMic()
  const [responses, setResponses] = useState<Response[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true)
      console.log('✓ Connected to server')
    }

    const handleDisconnect = () => {
      setIsConnected(false)
      console.log('✗ Disconnected from server')
    }

    const handleTranscript = (data: { text: string }) => {
      setResponses((prev) => [
        ...prev,
        { type: 'transcript', text: data.text },
      ])
    }

    const handleAiResponse = (data: { intent: string; reply: string }) => {
      setResponses((prev) => [
        ...prev,
        { type: 'ai-response', text: data.reply, intent: data.intent },
      ])
    }

    const handleError = (data: { message: string }) => {
      setResponses((prev) => [
        ...prev,
        { type: 'error', text: data.message },
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
  }, [])

  const clearResponses = () => setResponses([])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Smart Mirror</h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-8">
          <button
            onClick={start}
            disabled={isRecording}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
          >
            {isRecording ? '🎤 Recording...' : 'Start Recording'}
          </button>

          <button
            onClick={stop}
            disabled={!isRecording}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
          >
            Stop Recording
          </button>

          <button
            onClick={clearResponses}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
          >
            Clear
          </button>
        </div>

        {/* Responses */}
        <div className="bg-slate-700 rounded-lg p-6 space-y-3 max-h-96 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Responses</h2>
          {responses.length === 0 ? (
            <p className="text-gray-400">Waiting for responses...</p>
          ) : (
            responses.map((response, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  response.type === 'transcript'
                    ? 'bg-blue-900'
                    : response.type === 'ai-response'
                      ? 'bg-green-900'
                      : 'bg-red-900'
                }`}
              >
                <div className="text-xs font-semibold mb-1">
                  {response.type === 'transcript' && '🎤 Transcript'}
                  {response.type === 'ai-response' && '🤖 AI Response'}
                  {response.type === 'error' && '⚠️ Error'}
                  {response.intent && ` [${response.intent}]`}
                </div>
                <p className="text-sm">{response.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}