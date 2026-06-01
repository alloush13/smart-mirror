import type { RefObject } from "react";

type SkinAnalysisCapturePanelProps = {
    videoRef: RefObject<HTMLVideoElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    cameraReady: boolean;
    cameraStarting: boolean;
    isSecureContext: boolean;
    statusText: string;
    onStartCamera: () => void;
    onAnalyze: () => void;
    onClearResult: () => void;
    onResetCameraError: () => void;
    skinAnalysisUrl: string;
};

const SkinAnalysisCapturePanel = ({
    videoRef,
    canvasRef,
    cameraReady,
    cameraStarting,
    isSecureContext,
    statusText,
    onStartCamera,
    onAnalyze,
    onClearResult,
    onResetCameraError,
    skinAnalysisUrl,
}: SkinAnalysisCapturePanelProps) => {
    return (
        <div className="p-2 sm:p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-hidden flex flex-col">
            <div className="mb-2 sm:mb-3 md:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Skin Analysis</p>
                    <h1 className="mt-1 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900">
                        تحليل البشرة من الكاميرا
                    </h1>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-full bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                    <span className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${cameraReady ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <span className="text-xs whitespace-nowrap">{statusText}</span>
                </div>
            </div>

            {!isSecureContext && (
                <div className="mb-2 sm:mb-3 rounded-lg sm:rounded-2xl border border-amber-200 bg-amber-50 p-2 sm:p-4 text-xs sm:text-sm leading-5 sm:leading-6 text-amber-900">
                    المتصفح يحتاج إلى HTTPS أو localhost لكي يطلب إذن الكاميرا. إذا فتحت الصفحة عبر IP مباشر أو ملف محلي، فلن يظهر طلب الإذن.
                </div>
            )}

            <div className="relative flex aspect-[4/3] h-40 sm:h-56 md:h-72 lg:h-96 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-gray-300 bg-gray-100 flex-1 max-h-[calc(100vh-350px)]">
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

                {!cameraReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-white/80 px-3 sm:px-5 md:px-8 text-center backdrop-blur-sm">
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-gray-300 bg-gray-100" />
                        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">فتح الكاميرا</h2>
                        <p className="max-w-md text-xs sm:text-sm md:text-base leading-5 sm:leading-6 text-gray-600">
                            اضغط على زر تشغيل الكاميرا لطلب الإذن من المتصفح ثم التقط الصورة للتحليل.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                onResetCameraError();
                                onStartCamera();
                            }}
                            disabled={cameraStarting}
                            className="mt-2 inline-flex items-center justify-center rounded-lg sm:rounded-2xl bg-blue-600 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            {cameraStarting ? "جاري الفتح..." : "تشغيل الكاميرا"}
                        </button>
                    </div>
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-2 sm:mt-3 md:mt-4 grid gap-2 sm:gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={onAnalyze}
                    disabled={!cameraReady}
                    className="inline-flex items-center justify-center rounded-lg sm:rounded-2xl bg-blue-600 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                    تحليل الصورة
                </button>

                <button
                    type="button"
                    onClick={onClearResult}
                    className="inline-flex items-center justify-center rounded-lg sm:rounded-2xl border border-gray-300 bg-gray-50 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                    مسح النتيجة
                </button>
            </div>

            <div className="mt-2 sm:mt-3 flex flex-wrap gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={() => {
                        onResetCameraError();
                        onStartCamera();
                    }}
                    disabled={cameraStarting}
                    className="inline-flex items-center justify-center rounded-lg sm:rounded-2xl border border-gray-300 bg-gray-50 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {cameraStarting ? "جاري..." : cameraReady ? "إعادة تشغيل" : "طلب إذن"}
                </button>
            </div>

            <p className="mt-2 sm:mt-3 text-xs text-gray-600 truncate">
                سيتم إرسال الصورة إلى: <span className="break-all text-gray-800">{skinAnalysisUrl}</span>
            </p>
        </div>
    );
};

export default SkinAnalysisCapturePanel;
