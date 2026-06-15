FROM python:3.12

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app


WORKDIR /app

RUN pip install --upgrade pip setuptools wheel


RUN pip install --no-cache-dir \
    torch \
    torchvision \
    --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt -v

COPY src/ ./src/
COPY storage/ ./storage/
COPY proto/ ./proto/

RUN python -m grpc_tools.protoc \
    -I=./proto \
    --python_out=./src \
    --grpc_python_out=./src \
    ./proto/face_recognition.proto

EXPOSE 50054

CMD ["python", "src/main.py"]