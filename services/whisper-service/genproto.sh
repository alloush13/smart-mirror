#!/bin/sh

rm -rf proto gen
mkdir -p proto gen

cp -r ../../protos/voice/whisper.proto ./proto

python -m grpc_tools.protoc \
  -I./proto \
  --python_out=./gen \
  --pyi_out=./gen \
  --grpc_python_out=./gen \
  ./proto/whisper.proto 