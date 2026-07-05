import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SocketProvider } from './providers/SocketProvider.tsx';
import { CameraProvider } from './providers/CameraProvider.tsx';
import { AudioProvider } from './providers/AudioProvider.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketProvider>
      <AudioProvider>
        <CameraProvider>
          <App />
        </CameraProvider>
      </AudioProvider>
    </SocketProvider>
  </StrictMode>
)
