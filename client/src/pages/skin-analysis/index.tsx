import { useEffect, useState } from "react";
import { SKIN_ANALYSIS_URL } from "./constants";
import type { AnalysisResponse } from "./types";

import {
    SkinAnalysisCapturePanel,
    SkinAnalysisDetailsPanel,
} from "../../components/skin-analysis";

import { useSkinAnalysisCamera } from "./useSkinAnalysisCamera";
import { useSocket } from "../../hooks/useSocket";

const SkinAnalysisPage = () => {
    const socket = useSocket();

    const {
        videoRef,
        canvasRef,
        cameraReady,
        cameraStarting,
        cameraError,
        isSecureContext,
        startCamera,
        captureFrame,
        clearCameraError,
    } = useSkinAnalysisCamera();

    const [capturedImage, setCapturedImage] = useState("");
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");

    /**
     * Listen to socket results
     */
    useEffect(() => {
        const onResult = (data: AnalysisResponse) => {
            setAnalysis(data);
            setLastUpdated(new Date().toLocaleTimeString());
            setAnalyzing(false);
        };

        const onError = (err: { message: string }) => {
            setAnalysisError(err.message);
            setAnalyzing(false);
        };

        socket.on("skin:result", onResult);
        socket.on("skin:error", onError);

        return () => {
            socket.off("skin:result", onResult);
            socket.off("skin:error", onError);
        };
    }, [socket]);

    /**
     * Clear results
     */
    const handleClearResult = () => {
        setCapturedImage((current) => {
            if (current) {
                URL.revokeObjectURL(current);
            }
            return "";
        });

        setAnalysis(null);
        setAnalysisError("");
    };

    /**
     * Capture + send via socket
     */
    const handleAnalyze = async () => {
        setAnalysisError("");
        setAnalysis(null);

        try {
            setAnalyzing(true);

            const blob = await captureFrame();
            const preview = URL.createObjectURL(blob);

            setCapturedImage((current) => {
                if (current) {
                    URL.revokeObjectURL(current);
                }
                return preview;
            });

            // convert to ArrayBuffer (safe for socket transport)
            const buffer = await blob.arrayBuffer();

            socket.emit("skin:analyze", {
                image: buffer,
                conf: 0.5,
                iou: 0.4,
            });
        } catch (error) {
            setAnalysisError(
                error instanceof Error
                    ? error.message
                    : "حدث خطأ أثناء التحليل",
            );
            setAnalyzing(false);
        }
    };

    const detectedCount =
        analysis?.count ?? analysis?.detections?.length ?? 0;

    const cameraStatusText = cameraReady
        ? "Camera ready"
        : cameraStarting
          ? "Requesting permission..."
          : "Camera off";

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-2 py-2 sm:gap-4 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-10">
                <section className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200 bg-white shadow-lg">
                    <div className="grid gap-0 xl:grid-cols-[1.35fr_0.85fr]">
                        <SkinAnalysisCapturePanel
                            videoRef={videoRef}
                            canvasRef={canvasRef}
                            cameraReady={cameraReady}
                            cameraStarting={cameraStarting}
                            isSecureContext={isSecureContext}
                            statusText={cameraStatusText}
                            onStartCamera={startCamera}
                            onAnalyze={handleAnalyze}
                            onClearResult={handleClearResult}
                            onResetCameraError={clearCameraError}
                            skinAnalysisUrl={SKIN_ANALYSIS_URL}
                        />

                        <SkinAnalysisDetailsPanel
                            analysis={analysis}
                            cameraError={cameraError}
                            analysisError={analysisError}
                            capturedImage={capturedImage}
                            detectedCount={detectedCount}
                            analyzing={analyzing}
                            lastUpdated={lastUpdated}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SkinAnalysisPage;