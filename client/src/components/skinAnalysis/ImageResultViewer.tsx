import { useEffect, useRef } from "react";
import type { AnalysisResponse } from "../../services/vision/types";

type Props = {
    imageSrc: string;
    analysis: AnalysisResponse | null;
};

const ImageResultViewer = ({ imageSrc, analysis }: Props) => {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const meta = useRef({ w: 0, h: 0 });

    const draw = () => {
        if (!analysis || !imgRef.current || !canvasRef.current) return;

        const img = imgRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        const rect = img.getBoundingClientRect();

        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaleX = rect.width / meta.current.w;
        const scaleY = rect.height / meta.current.h;

        analysis.detections?.forEach((d) => {
            const box = d.bounding_box;
            if (!box?.center || !box.width || !box.height) return;

            const x =
                (box.center.x! - box.width / 2) * scaleX;

            const y =
                (box.center.y! - box.height / 2) * scaleY;

            const w = box.width * scaleX;
            const h = box.height * scaleY;

            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);

            ctx.fillStyle = "red";
            ctx.font = "14px Arial";
            ctx.fillText(
                `${d.class_name ?? "unknown"} ${(d.confidence ?? 0) * 100}%`,
                x,
                y - 5
            );
        });
    };

    useEffect(() => {
        draw();
    }, [analysis, imageSrc]);

    return (
        <div className="relative w-full">
            {imageSrc && (
                <img
                    ref={(el) => {
                        imgRef.current = el;

                        if (el) {
                            meta.current = {
                                w: el.naturalWidth,
                                h: el.naturalHeight,
                            };
                        }
                    }}
                    src={imageSrc}
                    className="w-full h-auto block"
                />
            )}

            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
        </div>
    );
};

export default ImageResultViewer;