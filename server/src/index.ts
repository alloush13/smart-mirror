import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { registerVoiceSocket } from './sockets/voice.socket';
import { createSkinRouter } from './routes/skin.routes';
import { SkinController } from './controllers/skin.controller';
import { SkinAnalysisService } from './services/skin-analysis.service';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
});

registerVoiceSocket(io);

const skinService = new SkinAnalysisService();
const skinController = new SkinController(skinService);
app.use('/skin', createSkinRouter(skinController));

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

import { ProtoLoader } from './grpc/proto-loader';
import { GrpcClientFactory } from './grpc/grpc-client-factory';
import { ProfileClient } from './grpc/ProfileClient';

const protoLoader = new ProtoLoader();
const clientFactory = new GrpcClientFactory();

// Whisper Client
const whisperClient = new ProfileClient(
  protoLoader,
  clientFactory,
  'protos/whisper.proto',
  'whisper-service:50051',
);

// TTS Client
const ttsClient = new ProfileClient(
  protoLoader,
  clientFactory,
  'protos/tts.proto',
  'tts-service:50052',
);

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('voice:data', async (audioChunk: Buffer) => {
    try {
      const transcript = await whisperClient.client.Transcribe({
        data: audioChunk,
      });

      const text = transcript.text;

      const audioStream = await ttsClient.client.Synthesize({
        text,
        voice: 'default',
      });

      socket.emit('voice:response', audioStream);
    } catch (err) {
      console.error(err);
      socket.emit('error', 'Voice processing failed');
    }
  });
});
