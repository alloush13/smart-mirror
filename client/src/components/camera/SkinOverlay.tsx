import { useEffect, useRef } from "react";

export type SkinDetection = {
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
};

export type SkinAnalysisResult = {
  detections: SkinDetection[];
  count: number;
};

type Props = {
  imageUrl: string;
  result: SkinAnalysisResult;
};

export default function SkinOverlay({ imageUrl, result }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();

  img.src = imageUrl;

  const draw = () => {
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.font = "16px Arial";
    ctx.fillStyle = "red";

    result.detections.forEach((d) => {
      const x = d.bounding_box.center.x - d.bounding_box.width / 2;
      const y = d.bounding_box.center.y - d.bounding_box.height / 2;

      ctx.strokeRect(
        x,
        y,
        d.bounding_box.width,
        d.bounding_box.height
      );

      ctx.fillText(d.class_name, x, y - 5);
    });
  };

  if (img.complete) {
    draw();
  } else {
    img.onload = draw;
  }
}, [imageUrl, result]);

  return (
    <>
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
    </>
  );
}