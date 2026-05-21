FROM python:slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY proto/ ./proto/
COPY src/ ./src/

RUN python -m grpc_tools.protoc \
    -I=./proto \
    --python_out=./src \
    --grpc_python_out=./src \
    ./proto/whisper.proto

WORKDIR /app/src

CMD ["python", "server.py"]