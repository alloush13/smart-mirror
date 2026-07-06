# Smart Mirror

A modular AI-powered Smart Mirror that combines voice interaction, computer vision, and real-time AI services. The project is built using a microservices architecture with Docker, enabling independent deployment and scalability of each component.

---

## Features

* 🎤 Voice assistant with speech recognition
* 🗣️ Arabic text-to-speech responses
* 📷 Camera control using voice commands
* 😀 Face detection and face recognition
* 🧴 AI-powered skin analysis
* ⚡ Real-time communication using Socket.IO
* 🔒 HTTPS support with Nginx and mkcert
* 🐳 Fully containerized with Docker Compose

---

## Architecture

```text
                   +----------------------+
                   |     React Client     |
                   +----------+-----------+
                              |
                         HTTPS / Socket.IO
                              |
                        +-----v------+
                        |    Nginx    |
                        +-----+------+
                              |
                   -------------------------
                   |                       |
             REST API                 Socket.IO
                   |                       |
             +-----v-----------------------v-----+
             |          Node.js Server           |
             +---+---------------+---------------+
                 |               |               |
                 |               |               |
         gRPC    |       gRPC    |      gRPC
                 |               |               |
       +---------v-+     +-------v------+   +----v----------------+
       | Whisper   |     | Face Service |   | Skin Analysis       |
       | Service   |     |              |   | Service             |
       +-----------+     +--------------+   +----------------------+
```

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Socket.IO Client

### Backend

* Node.js
* Express
* Socket.IO
* gRPC

### AI Services

* Whisper
* Face Recognition
* YOLO Skin Analysis
* Google Gemini

### Infrastructure

* Docker
* Docker Compose
* Nginx
* mkcert

---

## Project Structure

```text
smart-mirror/

├── client/
│   ├── src/
│   └── Dockerfile
│
├── server/
│   ├── src/
│   └── Dockerfile
│
├── services/
│   ├── whisper-service/
│   ├── face-recognition-service/
│   └── skin-analysis-service/
│
├── infra/
│   ├── nginx/
│   └── mkcert/
│
├── docker-compose.yml
└── README.md
```

---

## Requirements

* Docker
* Docker Compose

Optional (for local HTTPS development):

* mkcert

---

## Installation

Clone the repository:

```bash
git clone https://github.com/alloush13/smart-mirror.git

cd smart-mirror
```

---

## Environment Variables

Create the required `.env` files before running the project.

Example:

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Do **not** commit secret keys to the repository.

---

## Run the Project

```bash
docker compose up --build
```

The application will be available at:

```
https://localhost
```

---

## Services

| Service                  |  Port |
| ------------------------ | ----: |
| Nginx                    |   443 |
| Node Server              |  5000 |
| Whisper Service          | 50051 |
| Skin Analysis Service    | 50053 |
| Face Recognition Service | 50054 |

---

## Voice Commands

Example supported commands:

* Open the camera
* Close the camera
* Recognize my face
* Analyze my skin

---

## Main Capabilities

### Voice Assistant

Continuously listens for voice input, detects speech activity, sends audio for recognition, and executes AI-generated intents.

### Face Recognition

Captures an image from the camera and sends it to the face recognition service for identification.

### Skin Analysis

Captures a frame from the camera, performs AI inference using YOLO, and displays the detected skin conditions directly on the image.

### Camera Control

The camera can be opened or closed using voice commands.

---

## Security

* HTTPS enabled using Nginx.
* Local certificates generated with mkcert.
* API keys are provided through environment variables.

---

## Future Improvements

* Multi-language support
* User profiles
* Calendar integration
* Weather information
* Smart home integration
* Persistent local storage
* Wake-word detection
* Performance monitoring

---

## License

This project is intended for educational and research purposes.
