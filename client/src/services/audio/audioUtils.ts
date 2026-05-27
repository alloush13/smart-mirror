export function createAudioContext(sampleRate: number): AudioContext {
  return new globalThis.AudioContext({
    latencyHint: "interactive",
    sampleRate,
  });
}

export async function closeAudioContext(ctx: AudioContext | null) {
  if (!ctx || ctx.state === "closed") return;
  await ctx.close();
}

export function encodePCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);

  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  return output;
}

export function createChunks(pcm: Int16Array, size: number) {
  const chunks: Int16Array[] = [];

  for (let i = 0; i < pcm.length; i += size) {
    chunks.push(pcm.slice(i, i + size));
  }

  return chunks;
}

export function createSessionId() {
  return crypto.randomUUID?.() ?? `audio-${Date.now()}`;
}