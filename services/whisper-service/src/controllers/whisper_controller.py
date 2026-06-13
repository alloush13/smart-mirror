import grpc
from gen import whisper_pb2
from gen import whisper_pb2_grpc



class WhisperController(whisper_pb2_grpc.WhisperServicer):
    def __init__(self, whisper_service):
        self.whisper_service = whisper_service

    def Transcribe(self, request, context):
        res = self.whisper_service.transcribe(request.data)
        return whisper_pb2.TranscribeResponse(
            text=res["text"]
        )