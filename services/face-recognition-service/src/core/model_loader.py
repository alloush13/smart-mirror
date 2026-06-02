from ultralytics import YOLO
from src.core.config import Settings
from src.core.logger import logger

class ModelLoader:
    _model = None

    @classmethod
    def load(cls):
        if cls._model is None:
            logger.info(f"Loading model from: {Settings.MODEL_PATH}")
            cls._model = YOLO(Settings.MODEL_PATH)
            logger.info("Model loaded successfully")
        return cls._model