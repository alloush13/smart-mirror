import { Request, Response } from 'express';

import { SkinAnalysisService } from '../services/skin-analysis.service';

export class SkinController {
  constructor(private readonly skinService: SkinAnalysisService) {}

  async analyze(req: Request, res: Response) {
    const body = req.body as
      | {
          imageBase64?: unknown;
          conf?: unknown;
          iou?: unknown;
        }
      | undefined;

    const imageBase64 = body?.imageBase64;

    if (typeof imageBase64 !== 'string' || imageBase64.trim().length === 0) {
      return res.status(400).json({
        error: 'imageBase64 is required',
      });
    }

    const conf = typeof body?.conf === 'number' ? body.conf : undefined;
    const iou = typeof body?.iou === 'number' ? body.iou : undefined;

    try {
      const result = await this.skinService.analyzeImageBase64(imageBase64, {
        conf,
        iou,
      });

      return res.json(result);
    } catch (error) {
      const isProd = process.env.NODE_ENV === 'production';

      const message = isProd
        ? 'skin analysis failed'
        : error instanceof Error
          ? error.message
          : String(error);

      return res.status(502).json({
        success: false,
        error: message,
        detections: [],
        count: 0,
      });
    }
  }
}
