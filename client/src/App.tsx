import Mirror from './components/Mirror'
import Sidebar from './components/Sidebar'

import {
  useSmartMirrorSession,
} from './hooks/useSmartMirrorSession'
import { useCamera } from './hooks/useCamera'
import { useSkinAnalysis } from './hooks/useSkinAnalysis'

export default function App() {
  const {
    isMirrorActive,
    isListening,
    isSpeaking,
    turnOn,
    turnOff,
    toggleMirror,
    toggleListening,
  } = useSmartMirrorSession()

  const {
    videoRef,
    error: cameraError,
    retry,
  } = useCamera(isMirrorActive)

  const {
    result: skinResult,
    error: skinAnalysisError,
    isAnalyzing,
    analyzeCurrentFrame,
    clearResult,
  } = useSkinAnalysis()

  const handleAnalyzeSkin = async () => {
    await analyzeCurrentFrame(videoRef.current)
  }

  return (
    <div className="relative isolate h-screen w-screen overflow-hidden bg-black text-white">
      <div className="relative flex h-full w-full items-center justify-center">
        <Sidebar
          isActive={isMirrorActive}
          isListening={isListening}
          isSpeaking={isSpeaking}
          turnOn={turnOn}
          turnOff={turnOff}
          toggleMirror={toggleMirror}
          toggleListening={toggleListening}
          onAnalyzeSkin={handleAnalyzeSkin}
          isAnalyzingSkin={isAnalyzing}
          skinResultCount={skinResult?.count}
          skinAnalysisError={skinAnalysisError}
          onClearSkinResult={clearResult}
        />

        <div className="flex-1 h-full w-full flex items-center justify-center">
          <Mirror
            isActive={isMirrorActive}
            error={cameraError}
            videoRef={videoRef}
            retry={retry}
          />
        </div>
      </div>
    </div>
  )
}