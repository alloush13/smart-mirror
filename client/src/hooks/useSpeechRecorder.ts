import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "./useSocket";
import { useAudio } from "./useAudio";

const SPEECH_THRESHOLD = Number(import.meta.env.VITE_SPEECH_THRESHOLD ?? 50);
const END_OF_SPEECH_MS = Number(import.meta.env.VITE_END_OF_SPEECH_MS ?? 1200);
const MIN_RECORDING_MS = Number(import.meta.env.VITE_MIN_RECORDING_MS ?? 1200);

const SPEECH_START_EVENT = "assistant:speech-start";
const SPEECH_END_EVENT = "assistant:speech-end";

export const useSpeechRecorder = () => {
  const socket = useSocket();
  const { stream, analyser } = useAudio();

  const [volume, setVolume] = useState(0);
  const [recording, setRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const silenceRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const assistantSpeakingRef = useRef(false);

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;

    if (rec && rec.state === "recording") {
      rec.stop();
    }

    silenceRef.current = null;
    setRecording(false);
  }, []);

  const discard = useCallback(() => {
    chunksRef.current = [];
    startedAtRef.current = null;
    silenceRef.current = null;

    const rec = recorderRef.current;
    if (rec && rec.state === "recording") {
      rec.stop();
    }

    setRecording(false);
    setIsSpeaking(false);
  }, []);

  const start = useCallback(() => {
    if (!stream || !analyser) return;
    if (recorderRef.current) return;

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const startedAt = startedAtRef.current;

      const blob = new Blob(chunksRef.current, {
        type: "audio/webm",
      });

      chunksRef.current = [];
      startedAtRef.current = null;

      if (
        !startedAt ||
        assistantSpeakingRef.current ||
        Date.now() - startedAt < MIN_RECORDING_MS
      ) return;

      const buffer = await blob.arrayBuffer();

      socket.emit("speech:recognize", { audio: buffer });
    };

    const data = new Uint8Array(analyser.frequencyBinCount);

    const loop = () => {
      analyser.getByteFrequencyData(data);

      const avg = data.reduce((a, b) => a + b, 0) / data.length;

      setVolume(avg);

      const speaking = avg > SPEECH_THRESHOLD;

      if (assistantSpeakingRef.current) {
        setVolume(0);
        setIsSpeaking(false);
        discard();
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      setIsSpeaking(speaking);

      if (speaking) {
        silenceRef.current = null;

        if (recorder.state === "inactive") {
          chunksRef.current = [];
          startedAtRef.current = Date.now();
          recorder.start(250);
          setRecording(true);
        }
      } else if (recorder.state === "recording") {
        if (!silenceRef.current) silenceRef.current = Date.now();

        if (Date.now() - silenceRef.current > END_OF_SPEECH_MS) {
          stopRecording();
        }
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    loop();
  }, [stream, analyser, socket, discard, stopRecording]);

  // auto start when audio becomes ready
  useEffect(() => {
    if (stream && analyser) {
      start();
    }
  }, [stream, analyser, start]);

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    recorderRef.current?.stop();
    recorderRef.current = null;
  }, []);

  useEffect(() => {
    const onStart = () => {
      assistantSpeakingRef.current = true;
      discard();
    };

    const onEnd = () => {
      assistantSpeakingRef.current = false;
      silenceRef.current = null;
    };

    window.addEventListener(SPEECH_START_EVENT, onStart);
    window.addEventListener(SPEECH_END_EVENT, onEnd);

    return () => {
      window.removeEventListener(SPEECH_START_EVENT, onStart);
      window.removeEventListener(SPEECH_END_EVENT, onEnd);
    };
  }, [discard]);

  return {
    start,
    stop,
    volume,
    recording,
    isSpeaking,
  };
};