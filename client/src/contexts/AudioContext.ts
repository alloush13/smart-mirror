import { createContext } from "react";

export type AudioContextType = {
    stream: MediaStream | null;
    audioContext: AudioContext | null;
    analyser: AnalyserNode | null;
    start: () => Promise<void>;
    stop: () => Promise<void>;
};

export const AudioContext = createContext<AudioContextType | null>(null);