import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import { SocketManager } from './sockets/socket-manager';


const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const socketManager = new SocketManager(io);

socketManager.register();


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});