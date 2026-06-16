import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { useSocket } from "./useSocket";

const SPEECH_THRESHOLD = 60;
const END_OF_SPEECH_MS = 1200;
const MIN_RECORDING_MS = 1200;
const SPEECH_START_EVENT = "assistant:speech-start";
const SPEECH_END_EVENT = "assistant:speech-end";

export const useSpeechRecorder = () => {
    const socket = useSocket();

    const [volume, setVolume] = useState(0);
    const [recording, setRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recordingStartedAtRef = useRef<number | null>(null);
    const silenceStartedRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationRef = useRef<number>(0);
    const assistantSpeakingRef = useRef(false);
    

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

    const discardCurrentRecording = useCallback(() => {
        chunksRef.current = [];
        recordingStartedAtRef.current = null;
        silenceStartedRef.current = null;

        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
        ) {
            mediaRecorderRef.current.stop();
        }

        setRecording(false);
        setIsSpeaking(false);
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
            const recordingStartedAt = recordingStartedAtRef.current;

            const blob = new Blob(chunksRef.current, {
                type: "audio/webm",
            });

            chunksRef.current = [];
            recordingStartedAtRef.current = null;

            if (
                !recordingStartedAt ||
                assistantSpeakingRef.current ||
                Date.now() - recordingStartedAt < MIN_RECORDING_MS
            ) {
                return;
            }

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

            if (assistantSpeakingRef.current) {
                setVolume(0);
                setIsSpeaking(false);

                if (recorder.state === "recording") {
                    discardCurrentRecording();
                }

                animationRef.current = requestAnimationFrame(tick);
                return;
            }

            setIsSpeaking(speaking);

            if (speaking) {
                silenceStartedRef.current = null;

                if (recorder.state === "inactive") {
                    chunksRef.current = [];
                    recordingStartedAtRef.current = Date.now();
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
    }, [discardCurrentRecording, socket, stopRecording]);

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

    useEffect(() => {
        const handleAssistantSpeechStart = () => {
            assistantSpeakingRef.current = true;
            setVolume(0);
            discardCurrentRecording();
        };

        const handleAssistantSpeechEnd = () => {
            assistantSpeakingRef.current = false;
            silenceStartedRef.current = null;
        };

        window.addEventListener(
            SPEECH_START_EVENT,
            handleAssistantSpeechStart,
        );
        window.addEventListener(
            SPEECH_END_EVENT,
            handleAssistantSpeechEnd,
        );

        return () => {
            window.removeEventListener(
                SPEECH_START_EVENT,
                handleAssistantSpeechStart,
            );
            window.removeEventListener(
                SPEECH_END_EVENT,
                handleAssistantSpeechEnd,
            );
        };
    }, [discardCurrentRecording]);

    return {
        start,
        stop,
        volume,
        recording,
        isSpeaking,
    };
};
