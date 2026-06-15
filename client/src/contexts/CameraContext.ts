import { createContext, useContext } from "react";

export type CameraContextType = {
  active: boolean;
  stream: MediaStream | null;
  setStream: (s: MediaStream | null) => void;
  setActive: (v: boolean) => void;
};

export const CameraContext = createContext<CameraContextType | null>(null);

export const useCamera = () => {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error("CameraProvider missing");
  return ctx;
};