FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    build-essential \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONPATH=/app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY proto/ ./proto/
COPY src/ ./src/

RUN python -m grpc_tools.protoc \
    -I=./proto \
    --python_out=. \
    --grpc_python_out=. \
    ./proto/audio_processor.proto

EXPOSE 50052

CMD ["python", "src/server.py"]