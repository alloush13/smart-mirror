import * as grpc from '@grpc/grpc-js';
import { AudioStreamRequest } from './audio-stream-request.type';
import { AudioStreamEventResponse } from './audio-stream-event-response.type';

export type AudioStream = grpc.ClientDuplexStream<
  AudioStreamRequest,
  AudioStreamEventResponse
>;
export interface AudioProcessorClient {
  ProcessAudioStream(): AudioStream;
}
