import { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext.ts";

export const useSocket = () => useContext(SocketContext);