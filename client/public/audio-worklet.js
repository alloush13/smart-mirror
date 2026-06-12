class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.buffer = new Float32Array(4096);
    this.writeIndex = 0;

    this.FRAME_SIZE = 320; // 20ms @ 16kHz
  }

  process(inputs) {
    const input = inputs[0];

    if (!input || !input[0]) return true;

    const channel = input[0];

    for (let i = 0; i < channel.length; i++) {
      this.buffer[this.writeIndex++] = channel[i];

      if (this.writeIndex >= this.buffer.length) {
        this.writeIndex = 0;
      }
    }

    while (this.writeIndex >= this.FRAME_SIZE) {
      const frame = new Float32Array(this.FRAME_SIZE);

      for (let i = 0; i < this.FRAME_SIZE; i++) {
        frame[i] = this.buffer[i];
      }

      this.buffer.copyWithin(0, this.FRAME_SIZE);
      this.writeIndex -= this.FRAME_SIZE;

      this.port.postMessage(frame);
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);