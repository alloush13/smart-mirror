import { socket } from '../socket'

export async function sendAudio(blob: Blob) {
  const buffer = await blob.arrayBuffer()

  socket.emit('audio-final', buffer)
}