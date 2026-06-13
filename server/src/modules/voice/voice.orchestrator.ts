import { Socket } from 'socket.io';
import { WhisperStreamService } from './whisper/whisper-stream.service';
import { IntentService } from './intent/intent.service';

export class VoiceOrchestrator {
  private whisperStreamService = new WhisperStreamService();
  private intentService = new IntentService();

  handleConnection(socket: Socket) {
    socket.on('speech:recognize', async (data: { audio: ArrayBuffer }) => {
      try {
        const transcript = await this.whisperStreamService.transcribe(
          data.audio,
        );
        const intent = await this.intentService.detect(
          transcript.text,
        );
        socket.emit('intent:result', {
          text: transcript.text,
          intent,
        });
      } catch (error) {
        console.error('Error processing speech:', error);
        socket.emit('speech:error', { message: 'Failed to process speech' });
      }
    });

    socket.on('disconnect', () => {});
  }
}
