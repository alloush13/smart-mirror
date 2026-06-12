#!/bin/sh

rm -rf proto
mkdir -p proto

cp -r ../../protos/voice/audio_processor.proto ./proto/

python -m grpc_tools.protoc -I./proto --python_out=. --pyi_out=. --grpc_python_out=. ./proto/audio_processor.proto