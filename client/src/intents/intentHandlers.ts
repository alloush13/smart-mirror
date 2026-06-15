import { CameraService } from '../services/cameraService';
import { FaceRecognitionService } from '../services/faceRecognitionService';
import { SkinAnalysisService } from '../services/skinAnalysisService';

export const cameraService = new CameraService();
export const faceRecognitionService =
  new FaceRecognitionService();
export const skinAnalysisService =
  new SkinAnalysisService();