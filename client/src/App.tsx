import { Routes, Route } from "react-router";
import AppLayout from "./layouts/App.tsx"
import DashboardLayout from "./layouts/Dashboard.tsx"
import Home from "./pages/Home.tsx"
import AudioProcessor from "./pages/AudioProcessor.tsx"
import Health from "./pages/Health.tsx";

export default function App() {
 

  return (
  
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
      </Route>
      
      <Route path="dashboard" element={<DashboardLayout />}>
        <Route  index element={<Home />} />
        <Route path="audio-processor"  element={<AudioProcessor />} />
        <Route path="health"  element={<Health />} />
      </Route>
    </Routes>
  );
}