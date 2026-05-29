import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import { SocketManager } from './sockets/socket-manager';
import * as grpc from '@grpc/grpc-js';
import { loadProto } from './core/grpc/loader';
import { env } from './config/env';

const app = express();

app.use(cors());
app.use(express.json());

// Health endpoint: checks gRPC health of audio and whisper services
const healthProto = loadProto('proto/common/health.proto');

function checkGrpcHealth(address: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const client = new healthProto.common.HealthService(
        address,
        grpc.credentials.createInsecure(),
      );

      client.Check({}, (err: any, res: any) => {
        if (err) return resolve(`unreachable: ${err.message}`);
        return resolve(res?.status ?? 'unknown');
      });
    } catch (e: any) {
      return resolve(`error: ${String(e?.message ?? e)}`);
    }
  });
}

app.get('/health', async (_req, res) => {
  const serverStatus = 'ok';
  console.log("object");
  const audioStatus = await checkGrpcHealth(env.AUDIO_SERVICE_URL);
  const whisperStatus = await checkGrpcHealth(env.WHISPER_SERVICE_URL);

  res.json({
    server: serverStatus,
    audio: audioStatus,
    whisper: whisperStatus,
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

new SocketManager(io).register();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
