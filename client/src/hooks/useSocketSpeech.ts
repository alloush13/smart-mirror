import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import type { SpeechResult } from "../types/speech";

export const useSocketSpeech = () => {
    const socket = useSocket();

    const [transcript, setTranscript] = useState("");

    useEffect(() => {
        const onResult = (data: SpeechResult) => {
            setTranscript(data.text ?? "");
        };

        socket.on(
            "speech:result",
            onResult,
        );

        return () => {
            socket.off(
                "speech:result",
                onResult,
            );
        };
    }, [socket]);

    return { transcript };
};