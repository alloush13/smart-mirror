import { Socket } from 'socket.io';
import { WhisperService } from './whisper/whisper.service';
import { IntentService } from './intent/intent.service';

export class VoiceOrchestrator {
  static i = false;
  private whisperService = new WhisperService();
  private intentService = new IntentService();

  handleConnection(socket: Socket) {
    socket.on('speech:recognize', async (data: { audio: ArrayBuffer }) => {
      try {
        // await new Promise((r) => setTimeout(r, 600));
        // console.log('speech:recognize');
        // if (!VoiceOrchestrator.i) {
        //   socket.emit('intent:result', {
        //     type: 'COMMAND',
        //     intent: 'RUN_CAMERA',
        //     answer: 'بالتأكيد، الكاميرا تعمل الآن.',
        //   });
        //   VoiceOrchestrator.i = true;
        // } else {
        //   socket.emit('intent:result', {
        //     type: 'COMMAND',
        //     intent: 'SKIN_ANALYSIS',
        //     answer: 'حسنًا، سأقوم بتحليل البشرة الآن.',
        //   });
        // }

        const transcript = await this.whisperService.transcribe(data.audio);
        const intent = await this.intentService.detect(transcript.text);
        socket.emit('intent:result', intent);
      } catch (error) {
        console.error('Error processing speech:', error.message);
        socket.emit('speech:error', { message: 'Failed to process speech' });
      }
    });

    socket.on('disconnect', () => {});
  }
}
