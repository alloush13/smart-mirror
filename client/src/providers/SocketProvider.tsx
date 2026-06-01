import { type ReactNode } from "react";
import { SocketContext } from "../contexts/SocketContext";
import { socket } from "../socket";

interface Props {
    children: ReactNode;
}

export function SocketProvider({ children }: Props) {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}