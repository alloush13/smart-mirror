import type { AnalysisResponse } from "../../services/vision/types";
import ImageResultViewer from "./ImageResultViewer";

type Props = {
    analysis: AnalysisResponse | null;
    cameraError: string;
    analysisError: string;
    capturedImage: string;
    detectedCount: number;
    analyzing: boolean;
    lastUpdated: string;
};

const formatConfidence = (v?: number) =>
    typeof v === "number" ? `${(v * 100).toFixed(1)}%` : "—";

const SkinAnalysisDetailsPanel = ({
    analysis,
    cameraError,
    analysisError,
    capturedImage,
    detectedCount,
    analyzing,
    lastUpdated,
}: Props) => {
    const error = cameraError || analysisError;

    return (
        <aside className="flex flex-col gap-4 p-4 overflow-y-auto">

            {/* IMAGE ONLY (RIGHT SIDE RESPONSIBILITY) */}
            {capturedImage && (
                <div className="rounded-xl overflow-hidden border">
                    <ImageResultViewer
                        imageSrc={capturedImage}
                        analysis={analysis}
                    />
                </div>
            )}

            {/* STATS */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="text-xs">Detections</div>
                    <div className="text-xl font-semibold">
                        {detectedCount}
                    </div>
                </div>

                <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="text-xs">Status</div>
                    <div className="font-semibold">
                        {analyzing
                            ? "Processing"
                            : error
                            ? "Error"
                            : analysis
                            ? "Ready"
                            : "Idle"}
                    </div>
                </div>
            </div>

            {/* META */}
            <div className="p-3 border rounded-lg bg-gray-50">
                <div className="text-xs">Last update</div>
                <div className="text-sm">{lastUpdated || "—"}</div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
                    {error}
                </div>
            )}

            {/* DETECTIONS LIST */}
            {analysis?.detections?.map((d, i) => (
                <div key={i} className="p-3 border rounded-lg bg-white">
                    <div className="flex justify-between">
                        <span>{d.class_name ?? "unknown"}</span>
                        <span className="text-blue-600 text-sm">
                            {formatConfidence(d.confidence)}
                        </span>
                    </div>
                </div>
            ))}
        </aside>
    );
};

export default SkinAnalysisDetailsPanel;