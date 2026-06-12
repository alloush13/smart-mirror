#!/bin/sh

rm -rf proto
mkdir -p proto

cp -r ../../protos/vision/face_recognition.proto ./proto/

python -m grpc_tools.protoc -I./proto --python_out=. --pyi_out=. --grpc_python_out=. ./proto/face_recognition.proto