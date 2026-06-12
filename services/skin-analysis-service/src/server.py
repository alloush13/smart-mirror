import io
import os
from concurrent import futures

import grpc
from grpc_health.v1 import health, health_pb2, health_pb2_grpc
from PIL import Image
from ultralytics import YOLO

import skin_analysis_pb2
import skin_analysis_pb2_grpc

from src.core.logger import logger

# =========================
# Config
# =========================

MODEL_PATH = os.getenv("MODEL_PATH", "storage/model/best.pt")
DEFAULT_CONFIDENCE = float(os.getenv("MODEL_CONFIDENCE", "0.01"))
DEFAULT_IOU = float(os.getenv("MODEL_IOU", "0.7"))
PORT = os.getenv("GRPC_PORT", "50053")

model = YOLO(MODEL_PATH)


class SkinAnalysisService(
    skin_analysis_pb2_grpc.SkinAnalysisServicer
):

    def Analyze(self, request, context):
        try:
            logger.info(f"Model names: {model.names}")
            image = Image.open(io.BytesIO(request.image)).convert("RGB")

            conf = request.conf if request.conf else DEFAULT_CONFIDENCE
            iou = request.iou if request.iou else DEFAULT_IOU

            results = model(image, conf=conf, iou=iou, verbose=False)

            detections = []

            for result in results:
                if result.boxes is None:
                    continue

                for box in result.boxes:
                    x, y, w, h = box.xywh[0]

                    cls_id = int(box.cls[0])
                    confidence = float(box.conf[0])

                    detections.append(
                        skin_analysis_pb2.Detection(
                            bounding_box=skin_analysis_pb2.BoundingBox(
                                center=skin_analysis_pb2.Point(
                                    x=float(x),
                                    y=float(y),
                                ),
                                width=float(w),
                                height=float(h),
                            ),
                            confidence=confidence,
                            class_id=cls_id,
                            class_name=model.names.get(cls_id, "unknown"),
                        )
                    )

            return skin_analysis_pb2.AnalyzeResponse(
                detections=detections,
                count=len(detections),
            )

        except Exception as e:
            logger.info("Error occurred while analyzing image")
            context.abort(grpc.StatusCode.INTERNAL, str(e))


def serve():
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10)
    )

    # Skin service
    skin_analysis_pb2_grpc.add_SkinAnalysisServicer_to_server(
        SkinAnalysisService(),
        server,
    )

    # Health service
    health_servicer = health.HealthServicer()

    health_pb2_grpc.add_HealthServicer_to_server(
        health_servicer,
        server,
    )

    health_servicer.set(
        "vision.SkinAnalysis",
        health_pb2.HealthCheckResponse.SERVING,
    )

    server.add_insecure_port(f"0.0.0.0:{PORT}")
    server.start()

    logger.info(f"Skin analysis service started on {PORT}")

    server.wait_for_termination()


if __name__ == "__main__":
    serve()