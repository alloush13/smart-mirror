import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { useSocket } from "./useSocket";

const SPEECH_THRESHOLD = 30;
const END_OF_SPEECH_MS = 1200;

export const useSpeechRecorder = () => {
    const socket = useSocket();

    const [volume, setVolume] = useState(0);
    const [recording, setRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const silenceStartedRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationRef = useRef<number>(0);
    

    const stopRecording = useCallback(() => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
        ) {
            mediaRecorderRef.current.stop();
        }

        silenceStartedRef.current = null;
        setRecording(false);
    }, []);

    const start = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        streamRef.current = stream;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;

        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
            chunksRef.current.push(event.data);
        };

        recorder.onstop = async () => {
            const blob = new Blob(chunksRef.current, {
                type: "audio/webm",
            });

            chunksRef.current = [];

            const buffer = await blob.arrayBuffer();

            socket.emit("speech:recognize", {
                audio: buffer,
            });
        };

        const tick = () => {
            analyser.getByteFrequencyData(dataArray);

            const avg =
                dataArray.reduce((a, b) => a + b, 0) /
                dataArray.length;

            setVolume(avg);

            const speaking = avg > SPEECH_THRESHOLD;
            setIsSpeaking(speaking);

            if (speaking) {
                silenceStartedRef.current = null;

                if (recorder.state === "inactive") {
                    chunksRef.current = [];
                    recorder.start(250);
                    setRecording(true);
                }
            } else if (recorder.state === "recording") {
                if (!silenceStartedRef.current) {
                    silenceStartedRef.current = Date.now();
                }

                if (
                    Date.now() - silenceStartedRef.current >
                    END_OF_SPEECH_MS
                ) {
                    stopRecording();
                }
            }

            animationRef.current = requestAnimationFrame(tick);
        };

        tick();
    }, [socket, stopRecording]);

    const stop = useCallback(async () => {
        cancelAnimationFrame(animationRef.current);

        streamRef.current?.getTracks().forEach((t) => t.stop());

        if (audioContextRef.current) {
            await audioContextRef.current.close();
        }
    }, []);

    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return {
        start,
        stop,
        volume,
        recording,
        isSpeaking,
    };
};