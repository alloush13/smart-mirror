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
      this.skinService.registerSkinHandlers(socket);
      this.faceService.registerFaceHandlers(socket);
    });
  }
}
