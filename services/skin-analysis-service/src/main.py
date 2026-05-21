import base64
import io
import os
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from PIL import Image
from ultralytics import YOLO

app = FastAPI()

MODEL_PATH = os.getenv("MODEL_PATH", "storage/model/best.pt")
DEFAULT_CONFIDENCE = float(os.getenv("MODEL_CONFIDENCE", "0.01"))
DEFAULT_IOU = float(os.getenv("MODEL_IOU", "0.7"))

model = YOLO(MODEL_PATH)


def _extract_image_from_payload(payload: dict[str, Any]) -> Image.Image:
    image_b64 = payload.get("image_base64") or payload.get("imageBase64")

    if not image_b64 or not isinstance(image_b64, str):
        raise ValueError("JSON body must include image_base64")

    if "," in image_b64 and image_b64.strip().startswith("data:"):
        image_b64 = image_b64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(image_b64)
    except Exception as exc:
        raise ValueError("Invalid base64 image payload") from exc

    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def _normalize_detections(results):
    detections = []

    for result in results:
        if not hasattr(result, "boxes") or result.boxes is None:
            continue

        for box in result.boxes:
            x, y, w, h = box.xywh[0]
            cls_id = int(box.cls[0]) if len(box.cls) > 0 else 0
            detections.append({
                "x": float(x),
                "y": float(y),
                "width": float(w),
                "height": float(h),
                "confidence": float(box.conf[0]),
                "class": cls_id,
                "class_name": model.names.get(cls_id, "unknown")
                if hasattr(model, "names")
                else "unknown",
            })

    return detections


def _parse_float_arg(payload: dict[str, Any], name: str, default_value: float) -> float:
    raw_value = payload.get(name)

    if raw_value is None:
        return default_value

    try:
        return float(raw_value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{name} must be a number") from exc


@app.get("/health")
async def health_check():
    return {
        "success": True,
        "status": "ok",
        "model_path": MODEL_PATH,
    }


@app.post("/analyze")
async def analyze_skin(request: Request):
    try:
        content_type = request.headers.get("content-type", "")

        if "application/json" in content_type:
            payload = await request.json()
            if not isinstance(payload, dict):
                raise ValueError("JSON body must be an object")
            image = _extract_image_from_payload(payload)
        else:
            form = await request.form()
            payload = dict(form)

            uploaded_file = form.get("file")
            if uploaded_file is not None:
                image_bytes = await uploaded_file.read()
                image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            else:
                image = _extract_image_from_payload(payload)

        conf = _parse_float_arg(payload, "conf", DEFAULT_CONFIDENCE)
        iou = _parse_float_arg(payload, "iou", DEFAULT_IOU)

        results = model(image, conf=conf, iou=iou, verbose=False)
        detections = _normalize_detections(results)

        return {
            "success": True,
            "detections": detections,
            "count": len(detections),
        }
    except ValueError as exc:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": str(exc),
                "detections": [],
                "count": 0,
            },
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(exc),
                "detections": [],
                "count": 0,
            },
        )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
