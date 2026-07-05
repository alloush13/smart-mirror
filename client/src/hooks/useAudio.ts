import { useContext } from "react";
import { AudioContext } from "../contexts/AudioContext";

export const useAudio = () => {
    const ctx = useContext(AudioContext);

    if (!ctx) {
        throw new Error("AudioProvider is missing");
    }

    return ctx;
};