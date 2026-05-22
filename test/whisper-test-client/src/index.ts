import fs from "node:fs";
import path from "node:path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const AUDIO_PATH = path.resolve(process.cwd(), "audio/sample.ogg");
const PROTO_PATH = path.resolve(process.cwd(), "proto/whisper.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition) as any;

type AudioChunk = {
  data: Buffer;
  sample_rate: number;
  sequence: number;
  language?: string;
};

type Transcript = {
  text: string;
  is_final: boolean;
  confidence: number;
  start_time: number;
  end_time: number;
  language: string;
  processing_time_ms: number;
};

const WhisperService = grpcObject.voice.WhisperService as any;

const client = new WhisperService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

async function main() {
  console.log("Reading audio file...");

  const audioBuffer = fs.readFileSync(AUDIO_PATH);

  console.log("Opening gRPC stream...");

  const stream = client.StreamTranscribe();

  stream.on("data", (response: Transcript) => {
    console.log("\n=== TRANSCRIPT ===");
    console.log(response);
  });

  stream.on("error", console.error);
  stream.on("end", () => console.log("STREAM ENDED"));

  const CHUNK_SIZE = 32 * 1024;
  let sequence = 0;

  for (let offset = 0; offset < audioBuffer.length; offset += CHUNK_SIZE) {
    const chunk = audioBuffer.subarray(offset, offset + CHUNK_SIZE);

    stream.write({
      data: chunk,
      sample_rate: 16000,
      sequence,
      language: "ar",
    });

    console.log(`Sent chunk #${sequence} (${chunk.length})`);
    sequence++;
  }

  stream.end();
}

main().catch(console.error);