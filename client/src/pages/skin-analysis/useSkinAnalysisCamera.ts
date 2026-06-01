import { useEffect, useRef, useState } from "react";

export const useSkinAnalysisCamera = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraReady, setCameraReady] = useState(false);
    const [cameraStarting, setCameraStarting] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [isSecureContext, setIsSecureContext] = useState(true);

    const getTopLevelCameraError = () => {
        const host = window.location.host;
        const isAuthPage = window.location.pathname.includes("/auth/");
        const inFrame = window.self !== window.top;

        // Camera permissions are blocked in embedded auth/consent pages.
        if (isAuthPage || inFrame || host.includes("github.dev") && window.location.pathname.includes("/auth/")) {
            const cleanUrl = `${window.location.origin}/dashboard/skin-analysis`;
            return `فتح الكاميرا غير متاح داخل صفحة المصادقة أو داخل إطار مدمج. افتح هذا الرابط مباشرة في المتصفح: ${cleanUrl}`;
        }

        return "";
    };

    useEffect(() => {
        setIsSecureContext(window.isSecureContext);

        return () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    const startCamera = async () => {
        setCameraError("");
        setCameraStarting(true);

        try {
            const topLevelError = getTopLevelCameraError();
            if (topLevelError) {
                throw new Error(topLevelError);
            }

            if (!window.isSecureContext) {
                throw new Error("الكاميرا تحتاج إلى HTTPS أو localhost لكي تطلب الإذن من المتصفح");
            }

            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error("المتصفح لا يدعم تشغيل الكاميرا");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setCameraReady(true);
        } catch (error) {
            setCameraReady(false);
            setCameraError(error instanceof Error ? error.message : "تعذر فتح الكاميرا");
        } finally {
            setCameraStarting(false);
        }
    };

    const captureFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
            throw new Error("الكاميرا غير جاهزة بعد");
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("تعذر إنشاء صورة الالتقاط");
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        return new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("تعذر التقاط الصورة"));
                    return;
                }

                resolve(blob);
            }, "image/jpeg", 0.92);
        });
    };

    return {
        videoRef,
        canvasRef,
        cameraReady,
        cameraStarting,
        cameraError,
        isSecureContext,
        startCamera,
        captureFrame,
        clearCameraError: () => setCameraError(""),
    };
};