import io
import os
from concurrent import futures
from src.core.logger import logger

import grpc
from PIL import Image
from ultralytics import YOLO

import skin_analysis_pb2
import skin_analysis_pb2_grpc

# =========================
# Config
# =========================

MODEL_PATH = os.getenv("MODEL_PATH", "storage/model/best.pt")
DEFAULT_CONFIDENCE = float(os.getenv("MODEL_CONFIDENCE", "0.01"))
DEFAULT_IOU = float(os.getenv("MODEL_IOU", "0.7"))

# Load model once (important)
model = YOLO(MODEL_PATH)

PORT = os.getenv("GRPC_PORT", "50053")

class SkinAnalysisService(
    skin_analysis_pb2_grpc.SkinAnalysisServiceServicer
):

    def Analyze(self, request, context):
        try:
            # Convert bytes → Image
            image = Image.open(
                io.BytesIO(request.image)
            ).convert("RGB")

            # Defaults if not provided
            conf = request.conf if request.conf > 0 else DEFAULT_CONFIDENCE
            iou = request.iou if request.iou > 0 else DEFAULT_IOU

            # Run YOLO
            results = model(
                image,
                conf=conf,
                iou=iou,
                verbose=False
            )

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
                                    y=float(y)
                                ),
                                width=float(w),
                                height=float(h)
                            ),
                            confidence=confidence,
                            class_id=cls_id,
                            class_name=model.names.get(
                                cls_id,
                                "unknown"
                            )
                        )
                    )

            return skin_analysis_pb2.AnalyzeResponse(
                detections=detections,
                count=len(detections)
            )

        except Exception as e:
            context.abort(
                grpc.StatusCode.INTERNAL,
                str(e)
            )

    def Health(self, request, context):
        return skin_analysis_pb2.HealthResponse(
            success=True,
            status="ok",
            model_path=MODEL_PATH
        )


def serve():
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10)
    )

    skin_analysis_pb2_grpc.add_SkinAnalysisServiceServicer_to_server(
        SkinAnalysisService(),
        server
    )

    server.add_insecure_port(f"0.0.0.0:{PORT}")
    server.start()

    logger.info(f"Skin analysis service started on 0.0.0.0:{PORT}")

    server.wait_for_termination()


if __name__ == "__main__":
    serve()