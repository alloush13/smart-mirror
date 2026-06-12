import { Server, Socket } from 'socket.io';

import { VoiceOrchestrator } from '../modules/voice/voice.orchestrator';
import { SkinAnalysisService } from '../modules/vision/skin-analysis/skin-analysis.service';
import { FaceRecognitionService } from '../modules/vision/face-recognition/face-recognition.service';
export class SocketManager {
  private readonly voiceOrchestrator = new VoiceOrchestrator();
  private readonly skinService = new SkinAnalysisService();
  private readonly faceService = new FaceRecognitionService();

  constructor(private readonly io: Server) {}

  public register(): void {
    this.io.on('connection', (socket: Socket) => {
      this.voiceOrchestrator.handleConnection(socket);
      this.registerSkinHandlers(socket);
      this.registerFaceHandlers(socket);
    });
  }

  private registerFaceHandlers(socket: Socket): void {
    socket.on('face:recognize', async (data: { image: Buffer }) => {
      try {
        const result = await this.faceService.recognize(data.image);

        socket.emit('face:result', result);
      } catch (error) {
        console.log(error);
        socket.emit('face:error', {
          message: 'Face recognition failed',
        });
      }
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
