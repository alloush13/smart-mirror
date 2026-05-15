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
