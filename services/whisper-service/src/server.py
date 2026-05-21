import os
import shutil
import subprocess
import tempfile
from concurrent import futures

import grpc
from faster_whisper import WhisperModel

import whisper_pb2
import whisper_pb2_grpc


# -----------------------------
# Model
# -----------------------------
MODEL_NAME = "small"

model = WhisperModel(
    MODEL_NAME,
    device="cpu",
    compute_type="int8",
)


# -----------------------------
# Utils
# -----------------------------
def cleanup_file(path: str | None):
    if path and os.path.exists(path):
        os.remove(path)


def convert_to_wav(input_path: str) -> str:
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg is not installed")

    output_path = tempfile.NamedTemporaryFile(
        suffix=".wav",
        delete=False
    ).name

    result = subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            input_path,
            "-ar", "16000",
            "-ac", "1",
            output_path
        ],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        cleanup_file(output_path)
        raise RuntimeError(result.stderr or "ffmpeg error")

    return output_path


# -----------------------------
# gRPC Service
# -----------------------------
class WhisperService(whisper_pb2_grpc.WhisperServiceServicer):

    def StreamTranscribe(self, request_iterator, context):
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".webm")
        wav_path = None

        try:
            audio_buffer = b""

            for chunk in request_iterator:
                audio_buffer += chunk.data

            tmp_file.write(audio_buffer)
            tmp_file.close()

            wav_path = convert_to_wav(tmp_file.name)

            segments, _ = model.transcribe(
                wav_path,
                language="ar"
            )

            text = "".join(s.text for s in segments).strip()

            yield whisper_pb2.Transcript(
                text=text,
                is_final=True,
                confidence=1.0
            )

        except Exception as e:
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)

        finally:
            cleanup_file(tmp_file.name)
            cleanup_file(wav_path)


# -----------------------------
# Server bootstrap
# -----------------------------
def serve():
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=4)
    )

    whisper_pb2_grpc.add_WhisperServiceServicer_to_server(
        WhisperService(),
        server
    )

    server.add_insecure_port("0.0.0.0:50051")
    server.start()

    print("Whisper gRPC running on :50051")

    server.wait_for_termination()


if __name__ == "__main__":
    serve()