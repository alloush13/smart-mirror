import type { AnalysisResponse } from "../../pages/skin-analysis/types";
import { formatConfidence } from "../../pages/skin-analysis/utils";

type SkinAnalysisDetailsPanelProps = {
    analysis: AnalysisResponse | null;
    cameraError: string;
    analysisError: string;
    capturedImage: string;
    detectedCount: number;
    analyzing: boolean;
    lastUpdated: string;
};

const SkinAnalysisDetailsPanel = ({
    analysis,
    cameraError,
    analysisError,
    capturedImage,
    detectedCount,
    analyzing,
    lastUpdated,
}: SkinAnalysisDetailsPanelProps) => {
    const activeError = cameraError || analysisError;

    return (
        <aside className="flex flex-col gap-2 sm:gap-3 md:gap-4 border-t border-gray-200 p-2 sm:p-4 md:p-6 xl:border-l xl:border-t-0 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="rounded-lg sm:rounded-2xl border border-gray-200 bg-gray-50 p-2 sm:p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">Overview</p>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-5 sm:leading-6 text-gray-700 line-clamp-3">
                    التقط صورة مباشرة من الكاميرا ثم أرسلها للسيرفر لتحليل الحالة. التصميم هنا مرتّب ليتحوّل إلى عمود واحد على الهاتف حتى لا يحدث تداخل بين النصوص.
                </p>
            </div>

            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                <div className="rounded-lg sm:rounded-2xl border border-gray-200 bg-gray-50 p-2 sm:p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-600">Detections</p>
                    <p className="mt-1 sm:mt-2 text-lg sm:text-2xl md:text-3xl font-semibold text-gray-900">{detectedCount}</p>
                </div>
                <div className="rounded-lg sm:rounded-2xl border border-gray-200 bg-gray-50 p-2 sm:p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-600">Status</p>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                        {analyzing ? "جاري التحليل" : activeError ? "خطأ" : analysis ? "جاهز" : "في الانتظار"}
                    </p>
                </div>
            </div>

            <div className="rounded-lg sm:rounded-2xl border border-gray-200 bg-gray-50 p-2 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-600">آخر تحديث</p>
                        <p className="mt-1 truncate text-xs sm:text-sm text-gray-700">{lastUpdated || "—"}</p>
                    </div>

                    {capturedImage && (
                        <img
                            src={capturedImage}
                            alt="Captured preview"
                            className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
                        />
                    )}
                </div>
            </div>

            {activeError && (
                <div className="rounded-lg sm:rounded-2xl border border-red-200 bg-red-50 p-2 sm:p-4 text-xs sm:text-sm text-red-700 line-clamp-2">
                    {activeError}
                </div>
            )}

            {analysis && (
                <div className="flex-1 rounded-lg sm:rounded-2xl border border-gray-200 bg-gray-50 p-2 sm:p-4 overflow-y-auto">
                    <div className="mb-2 sm:mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gray-700">النتائج</h2>
                        <span className="rounded-full bg-emerald-100 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-emerald-700">
                            {detectedCount} نتيجة
                        </span>
                    </div>

                    {analysis.detections?.length ? (
                        <div className="space-y-2 sm:space-y-3">
                            {analysis.detections.map((detection, index) => (
                                <div
                                    key={`${detection.class_name ?? "detection"}-${index}`}
                                    className="rounded-lg sm:rounded-2xl border border-gray-200 bg-white p-2 sm:p-4 ring-1 ring-gray-100"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-xs sm:text-sm text-gray-900">
                                                {detection.class_name ?? "Unknown"}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-600">معرف: {detection.class_id ?? "—"}</p>
                                        </div>
                                        <div className="rounded-full bg-blue-100 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-blue-700 shrink-0">
                                            {formatConfidence(detection.confidence)}
                                        </div>
                                    </div>

                                    <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-gray-700 sm:grid-cols-3">
                                        <div className="rounded-lg bg-gray-100 p-1 sm:p-2">
                                            <span className="block text-gray-600">X</span>
                                            <span className="text-xs sm:text-sm">{Math.round(detection.bounding_box?.center?.x ?? 0)}</span>
                                        </div>
                                        <div className="rounded-lg bg-gray-100 p-1 sm:p-2">
                                            <span className="block text-gray-600">Y</span>
                                            <span className="text-xs sm:text-sm">{Math.round(detection.bounding_box?.center?.y ?? 0)}</span>
                                        </div>
                                        <div className="rounded-lg bg-gray-100 p-1 sm:p-2">
                                            <span className="block text-gray-600">الحجم</span>
                                            <span className="text-xs sm:text-sm">
                                                {Math.round(detection.bounding_box?.width ?? 0)}×{Math.round(detection.bounding_box?.height ?? 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs sm:text-sm leading-5 sm:leading-6 text-gray-600">لا توجد نتائج بعد.</p>
                    )}
                </div>
            )}
        </aside>
    );
};

export default SkinAnalysisDetailsPanel;
