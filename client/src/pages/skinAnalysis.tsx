import { useEffect, useRef, useState } from "react";

import {
    SkinAnalysisCapturePanel,
    SkinAnalysisDetailsPanel,
} from "../components/skinAnalysis";

import { useSkinAnalysisCamera } from "../services/vision/useSkinAnalysisCamera";
import { useSocket } from "../hooks/useSocket";

import type { AnalysisResponse } from "../services/vision/types";

const SkinAnalysis = () => {
    const socket = useSocket();

    const {
        videoRef,
        canvasRef,
        cameraReady,
        cameraStarting,
        cameraError,
        isSecureContext,
        startCamera,
        stopCamera,
        captureFrame,
        clearCameraError,
    } = useSkinAnalysisCamera();

    const [capturedImage, setCapturedImage] = useState<string>("");
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");

    const listenersAttached = useRef(false);

    // =========================
    // SOCKET LISTENERS (ONCE)
    // =========================
    useEffect(() => {
        if (listenersAttached.current) return;
        listenersAttached.current = true;

        const onResult = (data: AnalysisResponse) => {
            setAnalysis(data);
            setAnalyzing(false);
            setLastUpdated(new Date().toLocaleTimeString());
        };

        const onError = (err: { message?: string }) => {
            setAnalysisError(err?.message || "Analysis failed");
            setAnalyzing(false);
        };

        socket.on("skin:result", onResult);
        socket.on("skin:error", onError);

        return () => {
            socket.off("skin:result", onResult);
            socket.off("skin:error", onError);
        };
    }, [socket]);

    // =========================
    // CLEAR RESULT
    // =========================
    const handleClearResult = () => {
        setCapturedImage((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return "";
        });

        setAnalysis(null);
        setAnalysisError("");
    };

    // =========================
    // ANALYZE IMAGE
    // =========================
    const handleAnalyze = async () => {
        if (analyzing) return;

        setAnalysisError("");
        setAnalysis(null);
        setAnalyzing(true);

        try {
            const blob = await captureFrame();
            const preview = URL.createObjectURL(blob);

            setCapturedImage((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return preview;
            });

            const buffer = await blob.arrayBuffer();

            socket.emit("skin:analyze", {
                image: buffer,
                conf: 0.1,
                iou: 0.4,
            });
        } catch (e) {
            setAnalysisError(
                e instanceof Error ? e.message : "error"
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
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6">

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">

                    <div className="grid xl:grid-cols-[1.35fr_0.85fr]">

                        {/* ===================== LEFT: CAMERA ===================== */}
                        <SkinAnalysisCapturePanel
                            videoRef={videoRef}
                            canvasRef={canvasRef}
                            cameraReady={cameraReady}
                            cameraStarting={cameraStarting}
                            onStopCamera={stopCamera}
                            isSecureContext={isSecureContext}
                            statusText={cameraStatusText}
                            onStartCamera={startCamera}
                            onAnalyze={handleAnalyze}
                            onClearResult={handleClearResult}
                            onResetCameraError={clearCameraError}
                        />

                        {/* ===================== RIGHT: RESULT ONLY ===================== */}
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

export default SkinAnalysis;