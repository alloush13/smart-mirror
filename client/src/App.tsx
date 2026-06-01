import { Routes, Route } from "react-router";
import AppLayout from "./layouts/App.tsx"
import DashboardLayout from "./layouts/Dashboard.tsx"
import Home from "./pages/Home.tsx"
import AudioProcessor from "./pages/AudioProcessor.tsx"
import FaceRecognition from "./pages/FaceRecognition.tsx";
import Overview from "./pages/Overview.tsx";
import SkinAnalysis from "./pages/skin-analysis";

export default function App() {
 

  return (
  
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
      </Route>
      
      <Route path="dashboard" element={<DashboardLayout />}>
        <Route path="overview" element={<Overview />} />
        <Route path="face-recognition"  element={<FaceRecognition />} />
        <Route path="skin-analysis"  element={<SkinAnalysis />} />
        <Route path="audio-processor"  element={<AudioProcessor />} />
      </Route>
    </Routes>
  );
}