import { Socket } from 'socket.io';
import { WhisperStreamService } from './whisper/whisper-stream.service';

export class VoiceOrchestrator {
  handleConnection(socket: Socket) {
    const whisperStreamService = new WhisperStreamService();
    socket.on('speech:recognize', (data: { audio: ArrayBuffer }) => {
      whisperStreamService.recognizeSpeech(socket, data);
    });

    socket.on('disconnect', () => {});
  }
}
