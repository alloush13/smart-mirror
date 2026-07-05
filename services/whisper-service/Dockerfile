FROM python-base

WORKDIR /app

ENV PYTHONPATH=/app


COPY proto/ ./proto/
COPY src/ ./src/
COPY storage/ ./storage/

RUN mkdir -p gen

RUN python -m grpc_tools.protoc \
  -I./proto \
  --python_out=./gen \
  --pyi_out=./gen \
  --grpc_python_out=./gen \
  ./proto/whisper.proto 

EXPOSE 50051

CMD ["python", "src/main.py"]
