import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import { SocketManager } from './sockets/socket-manager';
import { healthRoutes } from './modules/health/health.route';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/', healthRoutes());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

new SocketManager(io).register();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
