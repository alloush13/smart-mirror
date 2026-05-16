import { socket } from '../socket'

export function registerMirrorSocketHandlers({
  onConnect,
  onDisconnect,
  onTranscript,
  onAiResponse,
  onError,
}: any) {
  socket.on('connect', onConnect)
  socket.on('disconnect', onDisconnect)
  socket.on('transcript', onTranscript)
  socket.on('ai-response', onAiResponse)
  socket.on('error', onError)

  return () => {
    socket.off('connect', onConnect)
    socket.off('disconnect', onDisconnect)
    socket.off('transcript', onTranscript)
    socket.off('ai-response', onAiResponse)
    socket.off('error', onError)
  }
}