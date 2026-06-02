from src.core.model_loader import ModelLoader
from src.core.config import Settings
from src.core.logger import logger


class Predictor:
    def __init__(self):
        self.model = ModelLoader.load()

    def predict(self, image, conf=None, iou=None):
        logger.debug(
            f"Inference | conf={conf or Settings.CONFIDENCE} | iou={iou or Settings.IOU}"
        )

        results = self.model(
            image,
            conf=conf or Settings.CONFIDENCE,
            iou=iou or Settings.IOU,
            verbose=False
        )

        return results