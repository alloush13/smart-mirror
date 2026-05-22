import { Server } from 'socket.io';

// import { registerVoiceEvents } from './events/voice.events';

export class SocketManager {
  constructor(private readonly io: Server) {}

  public register(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      //   registerVoiceEvents(socket);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
}
