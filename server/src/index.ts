import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { registerVoiceSocket } from './sockets/voice.socket';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
});

registerVoiceSocket(io);

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
