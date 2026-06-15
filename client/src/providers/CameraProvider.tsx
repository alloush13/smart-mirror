import { useState, type ReactNode } from "react";
import { CameraContext } from "../contexts/CameraContext";

interface Props {
  children: ReactNode;
}

export function CameraProvider({ children }: Props) {
  const [active, setActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  return (
    <CameraContext.Provider
      value={{ active, stream, setStream, setActive }}
    >
      {children}
    </CameraContext.Provider>
  );
}