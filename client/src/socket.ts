import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

export const socket: Socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
})

socket.on('connect', () => {
  console.log('[Socket.IO] Connected:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.log('[Socket.IO] Disconnected:', reason)
})

socket.on('error', (error) => {
  console.error('[Socket.IO] Error:', error)
})

socket.on('connect_error', (error) => {
  console.error('[Socket.IO] Connection Error:', error)
})