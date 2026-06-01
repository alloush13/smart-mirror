import { Server, Socket } from 'socket.io';

import { VoiceOrchestrator } from '../modules/voice/voice.orchestrator';
import { SkinAnalysisService } from '../modules/vision/skin-analysis/skin-analysis.service';

export class SocketManager {
  private readonly voice = new VoiceOrchestrator();
  private readonly skinService = new SkinAnalysisService();

  constructor(private readonly io: Server) {}

  public register(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('client connected:', socket.id);

      this.voice.handleConnection(socket);
      this.registerSkinHandlers(socket);
    });
  }

  private registerSkinHandlers(socket: Socket): void {
    socket.on(
      'skin:analyze',
      async (data: { image: Buffer; conf?: number; iou?: number }) => {
        try {
          const result = await this.skinService.analyzeSkin(
            data.image,
            data.conf,
            data.iou,
          );

          socket.emit('skin:result', result);
        } catch (error) {
          console.log(error);
          socket.emit('skin:error', {
            message: 'Skin analysis failed',
          });
        }
      },
    );
  }
}
