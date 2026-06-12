from src.core.model_loader import ModelLoader
from src.core.config import Settings
from src.core.logger import logger


class Predictor:

    def __init__(self):
        self.model = ModelLoader.load()

    def predict(self, image):
        logger.debug(
            "Running face recognition inference"
        )

        return self.model(
            image,
            conf=Settings.CONFIDENCE,
            iou=Settings.IOU,
            verbose=False,
        )