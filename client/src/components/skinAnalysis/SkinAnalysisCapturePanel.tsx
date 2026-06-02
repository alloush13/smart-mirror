import type { RefObject } from "react";

type SkinAnalysisCapturePanelProps = {
    videoRef: RefObject<HTMLVideoElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    cameraReady: boolean;
    cameraStarting: boolean;
    isSecureContext: boolean;
    statusText: string;
    onStartCamera: () => void;
    onStopCamera: () => void; // ✅ موجود
    onAnalyze: () => void;
    onClearResult: () => void;
    onResetCameraError: () => void;
};

const SkinAnalysisCapturePanel = ({
    videoRef,
    canvasRef,
    cameraReady,
    cameraStarting,
    isSecureContext,
    statusText,
    onStartCamera,
    onStopCamera, // ✅ لازم تضيفه هنا
    onAnalyze,
    onClearResult,
    onResetCameraError,
}: SkinAnalysisCapturePanelProps) => {
    return (
        <div className="p-2 sm:p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-hidden flex flex-col">

            {/* HEADER */}
            <div className="mb-2 sm:mb-3 md:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        Skin Analysis
                    </p>
                    <h1 className="mt-1 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900">
                        تحليل البشرة من الكاميرا
                    </h1>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-full bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                    <span
                        className={`h-2 w-2 rounded-full ${
                            cameraReady ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                    />
                    <span>{statusText}</span>
                </div>
            </div>

            {/* SECURITY WARNING */}
            {!isSecureContext && (
                <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    HTTPS أو localhost مطلوب لتشغيل الكاميرا
                </div>
            )}

            {/* CAMERA */}
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border bg-gray-100 flex-1">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                />

                {!cameraReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 text-center">
                        <button
                            onClick={() => {
                                onResetCameraError();
                                onStartCamera();
                            }}
                            disabled={cameraStarting}
                            className="mt-3 rounded-2xl bg-blue-600 px-5 py-2 text-white"
                        >
                            {cameraStarting ? "جاري الفتح..." : "تشغيل الكاميرا"}
                        </button>
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* ACTIONS */}
            <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                    onClick={onAnalyze}
                    disabled={!cameraReady}
                    className="rounded-2xl bg-blue-600 py-2 text-white disabled:bg-gray-300"
                >
                    تحليل الصورة
                </button>

                <button
                    onClick={onClearResult}
                    className="rounded-2xl border py-2"
                >
                    مسح النتيجة
                </button>
            </div>

            {/* CONTROL ROW */}
            <div className="mt-3 flex gap-2">
                <button
                    onClick={() => {
                        onResetCameraError();
                        onStartCamera();
                    }}
                    disabled={cameraStarting}
                    className="flex-1 rounded-2xl border py-2"
                >
                    {cameraReady ? "إعادة تشغيل" : "تشغيل"}
                </button>

                <button
                    onClick={onStopCamera}  // ✅ الآن يعمل
                    disabled={!cameraReady}
                    className="flex-1 rounded-2xl border border-red-300 bg-red-50 text-red-700 py-2"
                >
                    إيقاف الكاميرا
                </button>
            </div>

        </div>
    );
};

export default SkinAnalysisCapturePanel;