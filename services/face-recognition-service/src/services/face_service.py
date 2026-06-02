import grpc
import face_recognition_pb2
import face_recognition_pb2_grpc

from src.inference.predictor import Predictor
from src.core.logger import logger


class FaceService(face_recognition_pb2_grpc.FaceRecognitionServicer):

    def __init__(self):
        self.predictor = Predictor()
        self.model = self.predictor.model

    def DetectFace(self, request, context):
        try:
            results = self.predictor.predict(
                image=request.image,
                conf=request.conf,
                iou=request.iou
            )

            response = face_recognition_pb2.DetectResponse()

            total = 0

            for r in results:
                if not r.boxes:
                    continue

                for box in r.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()

                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])

                    response.detections.append(
                        face_recognition_pb2.Detection(
                            bounding_box=face_recognition_pb2.BoundingBox(
                                x=float(x1),
                                y=float(y1),
                                w=float(x2 - x1),
                                h=float(y2 - y1),
                            ),
                            confidence=conf,
                            class_id=cls_id,
                            class_name=self.model.names.get(cls_id, "unknown"),
                        )
                    )

                    total += 1

            response.count = total
            return response

        except Exception as e:
            logger.error(f"DetectFace error: {e}")
            context.abort(grpc.StatusCode.INTERNAL, str(e))