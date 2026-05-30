import { Server, Socket } from 'socket.io';

import { VoiceOrchestrator } from '../modules/voice/voice.orchestrator';

export class SocketManager {
  private readonly voice =
    new VoiceOrchestrator();

  constructor(
    private readonly io: Server,
  ) {}

  public register(): void {
    this.io.on(
      'connection',
      (socket: Socket) => {
        console.log(
          'client connected:',
          socket.id,
        );

        this.voice.handleConnection(
          socket,
        );
      },
    );
  }
}