import { createContext, useContext } from "react";

export type CameraContextType = {
  active: boolean;
  stream: MediaStream | null;
  faceRecognitionRequestId: number;
  setStream: (s: MediaStream | null) => void;
  setActive: (v: boolean) => void;
  requestFaceRecognition: () => void;
  skinAnalysisRequestId: number;
  requestSkinAnalysis: () => void;
};

export const CameraContext = createContext<CameraContextType | null>(null);

export const useCamera = () => {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error("CameraProvider missing");
  return ctx;
};
