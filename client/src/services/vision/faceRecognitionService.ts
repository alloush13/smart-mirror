import { Socket } from "socket.io-client";
import { SocketEvents } from "../../constants/socketEvents";

export class FaceRecognitionService {
  private socket: Socket;
  constructor(socket: Socket) {
    this.socket = socket;
  }

  recognize(payload: { image: ArrayBuffer; width: number; height: number }) {
    this.socket.emit(SocketEvents.FACE_RECOGNIZE, {
      image: payload.image,
      width: payload.width,
      height: payload.height,
      mimeType: "image/jpeg",
    });
  }
}
