FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir \
    torch \
    torchvision \
    --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY storage/ ./storage/
COPY proto/ ./proto/

RUN python -m grpc_tools.protoc \
    -I=./proto \
    --python_out=./src/generated \
    --grpc_python_out=./src/generated \
    ./proto/skin_analysis.proto

EXPOSE 50053

CMD ["python", "src/server.py"]