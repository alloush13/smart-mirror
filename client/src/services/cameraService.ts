export class CameraService {
  private stream: MediaStream | null = null;

  async start(): Promise<MediaStream> {
    if (this.stream) return this.stream;

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    return this.stream;
  }

  stop(): void {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }

  getStream() {
    return this.stream;
  }
}

export const cameraService = new CameraService();