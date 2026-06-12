FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app


WORKDIR /app

COPY requirements.txt .

# Install base dependencies
RUN pip install --no-cache-dir -r requirements.txt


COPY proto/ ./proto/
COPY src/ ./src/

# Generate gRPC files
RUN python -m grpc_tools.protoc -I./proto --python_out=. --pyi_out=. --grpc_python_out=. ./proto/audio_processor.proto

EXPOSE 50051

CMD ["python", "src/main.py"]