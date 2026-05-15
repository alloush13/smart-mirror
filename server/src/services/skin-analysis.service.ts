export interface SkinDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: number;
  class_name: string;
}

export interface SkinAnalysisResult {
  success: boolean;
  detections: SkinDetection[];
  count: number;
  error?: string;
}

export class SkinAnalysisService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.SKIN_ANALYSIS_URL ?? 'http://localhost:8001';
  }

  async analyzeImageBase64(
    imageBase64: string,
    options?: {
      conf?: number;
      iou?: number;
    },
  ): Promise<SkinAnalysisResult> {
    const payload: {
      image_base64: string;
      conf?: number;
      iou?: number;
    } = {
      image_base64: imageBase64,
    };

    if (options?.conf !== undefined) {
      payload.conf = options.conf;
    }

    if (options?.iou !== undefined) {
      payload.iou = options.iou;
    }

    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as SkinAnalysisResult;

    if (!response.ok || !data.success) {
      throw new Error(data.error ?? 'Skin analysis failed');
    }

    return data;
  }
}
