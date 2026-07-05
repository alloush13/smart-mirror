import { useState, type ReactNode } from "react";
import { CameraContext } from "../contexts/CameraContext";

interface Props {
  children: ReactNode;
}

export function CameraProvider({ children }: Props) {
  const [active, setActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [faceRecognitionRequestId, setFaceRecognitionRequestId] = useState(0);
  const [skinAnalysisRequestId, setSkinAnalysisRequestId] = useState(0);

  const requestFaceRecognition = () => {
    setFaceRecognitionRequestId((current) => current + 1);
  };

  const requestSkinAnalysis = () => {
    setSkinAnalysisRequestId(v => v + 1);
  };
  return (
    <CameraContext.Provider
      value={{
        active,
        stream,
        faceRecognitionRequestId,
        skinAnalysisRequestId,
        setStream,
        setActive,
        requestFaceRecognition,
        requestSkinAnalysis,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}