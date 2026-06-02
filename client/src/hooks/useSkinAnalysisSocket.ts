import { useEffect } from "react";
import type { AnalysisResponse } from "../services/vision/types";

export const useSkinAnalysisSocket = (
    socket: any,
    setAnalysis: (data: AnalysisResponse) => void,
    setAnalyzing: (v: boolean) => void,
    setError: (v: string) => void,
    setLastUpdated: (v: string) => void,
    draw: (data: AnalysisResponse) => void,
) => {
    useEffect(() => {
        const onResult = (data: AnalysisResponse) => {
            setAnalysis(data);
            setAnalyzing(false);
            setLastUpdated(new Date().toLocaleTimeString());
            draw(data);
        };

        const onError = (err: { message?: string }) => {
            setError(err?.message || "error");
            setAnalyzing(false);
        };

        socket.on("skin:result", onResult);
        socket.on("skin:error", onError);

        return () => {
            socket.off("skin:result", onResult);
            socket.off("skin:error", onError);
        };
    }, [socket]);
};