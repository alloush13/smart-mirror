FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    build-essential \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Install base dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install CPU-only PyTorch
RUN pip install --no-cache-dir \
    torch \
    torchaudio \
    --index-url https://download.pytorch.org/whl/cpu

COPY proto/ ./proto/
COPY src/ ./src/

# Generate gRPC files
RUN python -m grpc_tools.protoc \
    -I=./proto \
    --python_out=. \
    --grpc_python_out=. \
    ./proto/audio_processor.proto

EXPOSE 50051

CMD ["python", "src/server.py"]