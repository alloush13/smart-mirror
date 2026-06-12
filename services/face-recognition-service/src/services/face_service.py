import grpc
import cv2
import numpy as np

import face_recognition_pb2
import face_recognition_pb2_grpc

from src.inference.predictor import Predictor
from src.core.logger import logger


class FaceService(
    face_recognition_pb2_grpc.FaceRecognitionServicer
):

    def __init__(self):
        self.predictor = Predictor()
        self.model = self.predictor.model

    def Recognize(self, request, context):
        logger.info("Received face recognition request")
        try:
            image_np = np.frombuffer(
                request.image,
                dtype=np.uint8,
            )

            image = cv2.imdecode(
                image_np,
                cv2.IMREAD_COLOR,
            )

            if image is None:
                context.abort(
                    grpc.StatusCode.INVALID_ARGUMENT,
                    "Invalid image",
                )

            results = self.predictor.predict(image)

            response = (
                face_recognition_pb2.RecognizeResponse()
            )

            for result in results:

                if result.boxes is None:
                    continue

                for box in result.boxes:

                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])

                    response.predictions.append(
                        face_recognition_pb2.Prediction(
                            name=self.model.names.get(
                                class_id,
                                "unknown",
                            ),
                            confidence=confidence,
                        )
                    )

            return response

        except Exception as e:
            logger.exception(
                "Face recognition failed"
            )

            context.abort(
                grpc.StatusCode.INTERNAL,
                str(e),
            )