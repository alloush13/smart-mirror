import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import { SocketManager } from './sockets/socket-manager';
import { checkGrpcHealth } from './core/grpc/health';
import { env } from './config/env';

// Initialize Express app
const app = express();

app.use(cors());
app.use(express.json());

// Health endpoint: checks gRPC health of audio and whisper services
app.get('/health', async (_req, res) => {
  try {
    const [audioStatus, whisperStatus] =
  await Promise.all([
    checkGrpcHealth(
      env.AUDIO_PROCESSOR_SERVICE_URL,
      'audio.AudioProcessor',
    ),
    checkGrpcHealth(
      env.WHISPER_SERVICE_URL,
      'voice.Whisper',
    ),
  ]);
    res.json({ audio: audioStatus, whisper: whisperStatus });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

new SocketManager(io).register();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
