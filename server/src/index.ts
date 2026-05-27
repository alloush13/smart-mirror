// import express from 'express';
// import http from 'http';
// import cors from 'cors';
// import { Server } from 'socket.io';

// import { SocketManager } from './sockets/socket-manager';

// const app = express();

// app.use(cors());
// app.use(express.json());

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: '*',
//   },
// });

// new SocketManager(io).register();

// const PORT = process.env.PORT || 3000;

// server.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('client connected:', socket.id);

  socket.on('audio', (packet) => {
    // هنا تستقبل الصوت
    console.log('audio packet:', packet.sequence);

    // packet.data = ArrayBuffer (PCM)
    // لاحقًا: ترسله إلى STT أو تخزنه
  });

  socket.on('disconnect', () => {
    console.log('client disconnected');
  });
});

server.listen(3000, () => {
  console.log('server running on http://localhost:3000');
});
