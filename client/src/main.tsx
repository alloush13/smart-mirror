import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './index.css'
import App from './App.tsx'
import { SocketProvider } from './providers/SocketProvider.tsx';
import { CameraProvider } from './providers/CameraProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <SocketProvider>
      <CameraProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </CameraProvider>
    </SocketProvider>
  </BrowserRouter>
)
