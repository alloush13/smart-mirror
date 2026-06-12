import { env } from '../../config/env';
import { checkGrpcHealth } from '../../core/grpc/health';
import { Request, Response } from 'express';

export class HealthController {
  async check(req: Request, res: Response) {
    try {
      const [
        audioStatus,
        whisperStatus,
        skinAnalysisStatus,
        faceRecognitionStatus,
      ] = await Promise.all([
        checkGrpcHealth(
          env.AUDIO_PROCESSOR_SERVICE_URL,
          'voice.AudioProcessor',
        ),
        checkGrpcHealth(env.WHISPER_SERVICE_URL, 'voice.Whisper'),
        checkGrpcHealth(env.SKIN_ANALYSIS_SERVICE_URL, 'vision.SkinAnalysis'),
        checkGrpcHealth(
          env.FACE_RECOGNITION_SERVICE_URL,
          'vision.FaceRecognition',
        ),
      ]);
      return res.json({
        audio: audioStatus,
        whisper: whisperStatus,
        skinAnalysis: skinAnalysisStatus,
        faceRecognition: faceRecognitionStatus,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Health check failed' });
    }
  }
}
