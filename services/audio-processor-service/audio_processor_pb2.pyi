from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AudioStreamRequest(_message.Message):
    __slots__ = ("pcm", "session_id", "sample_rate", "channels", "timestamp_ms")
    PCM_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    SAMPLE_RATE_FIELD_NUMBER: _ClassVar[int]
    CHANNELS_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_MS_FIELD_NUMBER: _ClassVar[int]
    pcm: bytes
    session_id: str
    sample_rate: int
    channels: int
    timestamp_ms: int
    def __init__(self, pcm: _Optional[bytes] = ..., session_id: _Optional[str] = ..., sample_rate: _Optional[int] = ..., channels: _Optional[int] = ..., timestamp_ms: _Optional[int] = ...) -> None: ...

class AudioStreamEventResponse(_message.Message):
    __slots__ = ("speech_started", "speech_frame", "speech_ended", "utterance_ready", "error")
    SPEECH_STARTED_FIELD_NUMBER: _ClassVar[int]
    SPEECH_FRAME_FIELD_NUMBER: _ClassVar[int]
    SPEECH_ENDED_FIELD_NUMBER: _ClassVar[int]
    UTTERANCE_READY_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    speech_started: SpeechStarted
    speech_frame: SpeechFrame
    speech_ended: SpeechEnded
    utterance_ready: UtteranceReady
    error: ErrorEvent
    def __init__(self, speech_started: _Optional[_Union[SpeechStarted, _Mapping]] = ..., speech_frame: _Optional[_Union[SpeechFrame, _Mapping]] = ..., speech_ended: _Optional[_Union[SpeechEnded, _Mapping]] = ..., utterance_ready: _Optional[_Union[UtteranceReady, _Mapping]] = ..., error: _Optional[_Union[ErrorEvent, _Mapping]] = ...) -> None: ...

class SpeechStarted(_message.Message):
    __slots__ = ("timestamp_ms",)
    TIMESTAMP_MS_FIELD_NUMBER: _ClassVar[int]
    timestamp_ms: int
    def __init__(self, timestamp_ms: _Optional[int] = ...) -> None: ...

class SpeechFrame(_message.Message):
    __slots__ = ("cleaned_pcm", "speech_probability", "speech_ratio", "contains_speech", "timestamp_ms")
    CLEANED_PCM_FIELD_NUMBER: _ClassVar[int]
    SPEECH_PROBABILITY_FIELD_NUMBER: _ClassVar[int]
    SPEECH_RATIO_FIELD_NUMBER: _ClassVar[int]
    CONTAINS_SPEECH_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_MS_FIELD_NUMBER: _ClassVar[int]
    cleaned_pcm: bytes
    speech_probability: float
    speech_ratio: float
    contains_speech: bool
    timestamp_ms: int
    def __init__(self, cleaned_pcm: _Optional[bytes] = ..., speech_probability: _Optional[float] = ..., speech_ratio: _Optional[float] = ..., contains_speech: bool = ..., timestamp_ms: _Optional[int] = ...) -> None: ...

class SpeechEnded(_message.Message):
    __slots__ = ("timestamp_ms", "final_speech_ratio", "duration_ms")
    TIMESTAMP_MS_FIELD_NUMBER: _ClassVar[int]
    FINAL_SPEECH_RATIO_FIELD_NUMBER: _ClassVar[int]
    DURATION_MS_FIELD_NUMBER: _ClassVar[int]
    timestamp_ms: int
    final_speech_ratio: float
    duration_ms: int
    def __init__(self, timestamp_ms: _Optional[int] = ..., final_speech_ratio: _Optional[float] = ..., duration_ms: _Optional[int] = ...) -> None: ...

class UtteranceReady(_message.Message):
    __slots__ = ("session_id", "pcm", "sample_rate", "duration_ms", "timestamp_ms")
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    PCM_FIELD_NUMBER: _ClassVar[int]
    SAMPLE_RATE_FIELD_NUMBER: _ClassVar[int]
    DURATION_MS_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_MS_FIELD_NUMBER: _ClassVar[int]
    session_id: str
    pcm: bytes
    sample_rate: int
    duration_ms: int
    timestamp_ms: int
    def __init__(self, session_id: _Optional[str] = ..., pcm: _Optional[bytes] = ..., sample_rate: _Optional[int] = ..., duration_ms: _Optional[int] = ..., timestamp_ms: _Optional[int] = ...) -> None: ...

class ErrorEvent(_message.Message):
    __slots__ = ("code", "message")
    CODE_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    code: str
    message: str
    def __init__(self, code: _Optional[str] = ..., message: _Optional[str] = ...) -> None: ...
