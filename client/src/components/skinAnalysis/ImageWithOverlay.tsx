import { useEffect, useRef } from "react";
import type { AnalysisResponse } from "../../services/vision/types";

interface Props {
    imageSrc: string;
    analysis: AnalysisResponse | null;
    onImageMeta: (w: number, h: number) => void;
}

const ImageWithOverlay = ({ imageSrc, analysis, onImageMeta }: Props) => {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const metaRef = useRef({ width: 0, height: 0 });

    const draw = () => {
        const img = imgRef.current;
        const canvas = canvasRef.current;

        if (!img || !canvas || !analysis) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = img.getBoundingClientRect();

        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaleX = rect.width / metaRef.current.width;
        const scaleY = rect.height / metaRef.current.height;

        analysis.detections.forEach((d) => {
            const { bounding_box, class_name, confidence } = d;

            const x =
                (bounding_box.center.x -
                    bounding_box.width / 2) *
                scaleX;

            const y =
                (bounding_box.center.y -
                    bounding_box.height / 2) *
                scaleY;

            const w = bounding_box.width * scaleX;
            const h = bounding_box.height * scaleY;

            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);

            ctx.fillStyle = "red";
            ctx.font = "14px Arial";
            ctx.fillText(
                `${class_name} ${(confidence * 100).toFixed(1)}%`,
                x,
                y - 5,
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
                            metaRef.current = {
                                width: el.naturalWidth,
                                height: el.naturalHeight,
                            };
                            onImageMeta(el.naturalWidth, el.naturalHeight);
                        }
                    }}
                    src={imageSrc}
                    className="w-full h-auto block"
                    alt="analysis"
                />
            )}

            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
        </div>
    );
};

export default ImageWithOverlay;