FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY proto/ ./proto/
COPY src/ ./src/

RUN python -m grpc_tools.protoc \
    -I=./proto \
    --python_out=./src \
    --grpc_python_out=./src \
    ./proto/whisper.proto

EXPOSE 50051

CMD ["python", "src/server.py"]