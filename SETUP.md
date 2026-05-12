# Smart Mirror Server-Client Connection Setup

## Overview
The server and client are now fully connected using Socket.IO for real-time communication and REST API for standard requests.

## Architecture

### Server (Port 3000)
- **Express** - REST API framework
- **Socket.IO** - Real-time bi-directional communication
- **GenAI Service** - Gemini AI integration
- **Chat Controller** - Handles chat requests

### Client (Port 5173)
- **React + TypeScript** - Frontend framework
- **Socket.IO Client** - Real-time communication
- **Vite** - Development server

## Environment Configuration

### Server (.env)
```env
PORT=3000
MONGODB_URI=mongodb://root:root@127.0.0.1:27017/mirror?authSource=admin
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-strong-secret
GEMINI_API_KEY=your-gemini-key
```

### Client (.env)
```env
VITE_SERVER_URL=http://localhost:3000
```

## Running the Project

### Option 1: Development Mode (Recommended)

#### Terminal 1 - Start Server
```bash
cd server
npm run dev
```

#### Terminal 2 - Start Client
```bash
cd client
npm run dev
```

The client will be available at `http://localhost:5173`
The server will be available at `http://localhost:3000`

### Option 2: Docker Compose
```bash
docker-compose up
```

This starts:
- Node.js server
- MongoDB
- Mongo Express (DB UI at http://localhost:8081)

## API Endpoints

### Chat API
**POST** `/api/chat`
```json
{
  "text": "Your message here"
}
```

Response:
```json
{
  "reply": "AI generated response"
}
```

## Socket.IO Events

### Client → Server
- `audio-chunk` - Audio data from microphone
  ```typescript
  socket.emit('audio-chunk', arrayBuffer)
  ```

### Server → Client
- `connect` - Connection established
- `disconnect` - Connection closed
- `error` - Error occurred

## Testing the Connection

1. **Check Server Console**
   - Should see: `✓ Server running on http://localhost:3000`
   - When client connects: `[Socket.IO] Client connected: socket-id`

2. **Check Client Console**
   - Should see: `[Socket.IO] Connected: socket-id`
   - When sending audio: `[Socket.IO] Received audio chunk: X bytes`

3. **Test REST API**
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello"}'
   ```

4. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

## Features Enabled

✓ Real-time audio streaming (WebSocket)
✓ Chat API with Gemini AI
✓ CORS configured for local development
✓ Error handling and logging
✓ Socket.IO reconnection strategy
✓ Environment variable support

## Next Steps

1. ✓ Server and client are connected
2. Add authentication middleware
3. Integrate MongoDB for data persistence
4. Add voice transcription service
5. Deploy to production

## Troubleshooting

### Connection Refused
- Ensure server is running on port 3000
- Check that CLIENT_ORIGIN matches client URL

### CORS Errors
- Verify CLIENT_ORIGIN environment variable
- Check browser console for detailed error

### Socket Connection Fails
- Check server console for connection logs
- Ensure Socket.IO version compatibility

### Gemini API Errors
- Verify GEMINI_API_KEY is set
- Check API quota and location restrictions
