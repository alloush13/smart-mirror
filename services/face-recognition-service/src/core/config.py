import os

class Settings:
    MODEL_PATH = os.getenv("MODEL_PATH", "storage/model/best.pt")
    PORT = int(os.getenv("GRPC_PORT", "50054"))

    CONFIDENCE = float(os.getenv("MODEL_CONFIDENCE", "0.25"))
    IOU = float(os.getenv("MODEL_IOU", "0.7"))