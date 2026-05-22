import tempfile
import time

import grpc

import whisper_pb2
import whisper_pb2_grpc

from src.core.config import MAX_AUDIO_SIZE
from src.core.logger import logger

from src.services.audio_converter import (
    cleanup_file,
    convert_to_wav,
)

from src.services.transcriber import (
    transcribe_audio,
)


class WhisperService(
    whisper_pb2_grpc.WhisperServiceServicer
):

    def StreamTranscribe(
        self,
        request_iterator,
        context,
    ):
        start_time = time.time()

        tmp_file = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".webm",
        )

        wav_path = None

        chunks = []

        total_size = 0

        language = "ar"

        try:
            for chunk in request_iterator:
                total_size += len(chunk.data)

                if total_size > MAX_AUDIO_SIZE:
                    context.abort(
                        grpc.StatusCode.INVALID_ARGUMENT,
                        "audio too large",
                    )

                chunks.append(chunk.data)

                if chunk.language:
                    language = chunk.language

            audio_buffer = b"".join(chunks)

            tmp_file.write(audio_buffer)
            tmp_file.close()

            wav_path = convert_to_wav(tmp_file.name)

            result = transcribe_audio(
                wav_path=wav_path,
                language=language,
            )

            processing_time_ms = int(
                (time.time() - start_time) * 1000
            )

            logger.info(
                "Transcription completed in %sms",
                processing_time_ms,
            )

            yield whisper_pb2.Transcript(
                text=result["text"],
                is_final=True,
                confidence=1.0,
                start_time=0,
                end_time=0,
                language=result["language"],
                processing_time_ms=processing_time_ms,
            )

        except Exception as exc:
            logger.exception(exc)

            context.set_details(str(exc))

            context.set_code(
                grpc.StatusCode.INTERNAL
            )

        finally:
            cleanup_file(tmp_file.name)

            cleanup_file(wav_path)