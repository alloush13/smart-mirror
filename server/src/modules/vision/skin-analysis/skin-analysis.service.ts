import { skinAnalysisClient } from './skin-analysis.client';

export interface AnalyzeRequest {
  image: Buffer;
  conf?: number;
  iou?: number;
}

export interface AnalyzeResponse {
  detections: {
    bounding_box: {
      center: {
        x: number;
        y: number;
      };
      width: number;
      height: number;
    };
    confidence: number;
    class_id: number;
    class_name: string;
  }[];
  count: number;
}

/**
 * Skin Analysis Service (gRPC wrapper)
 */
export class SkinAnalysisService {
  /**
   * Analyze skin image via gRPC
   */
  analyzeSkin(
    imageData: Buffer,
    conf?: number,
    iou?: number,
  ): Promise<AnalyzeResponse> {
    return new Promise((resolve, reject) => {
      skinAnalysisClient.Analyze(
        {
          image: imageData,
          conf,
          iou,
        },
        (error: Error | null, response: AnalyzeResponse) => {
          if (error) {
            reject(error);
            return;
          }
          console.log(response);
          resolve(response);
        },
      );
    });
  }
}
