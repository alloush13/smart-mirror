#!/usr/bin/env python3
"""
Node.js compatible model inference API
يمكن Node.js من استدعاء النموذج عبر هذا الـ API
"""
import json
import sys
import base64
import os
from io import BytesIO

try:
    from ultralytics import YOLO
    from PIL import Image
    
    # Load model once
    model = YOLO("storage/model/best.pt")
    MODEL_CONFIDENCE = float(os.getenv("MODEL_CONFIDENCE", "0.01"))
    MODEL_IOU = float(os.getenv("MODEL_IOU", "0.7"))

    def run_inference(image):
        """Run model inference and normalize detections"""
        results = model(image, conf=MODEL_CONFIDENCE, iou=MODEL_IOU, verbose=False)

        detections = []
        for result in results:
            if hasattr(result, 'boxes') and result.boxes is not None:
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
                        "class_name": model.names.get(cls_id, "unknown") if hasattr(model, 'names') else "unknown"
                    })

        return {"success": True, "detections": detections, "count": len(detections)}
    
    def predict(image_base64):
        """تشغيل الكشف عن الأجسام وإرجاع النتائج"""
        try:
            # Decode base64 image
            image_data = base64.b64decode(image_base64)
            image = Image.open(BytesIO(image_data))
            return run_inference(image)
        
        except Exception as e:
            return {"success": False, "error": str(e), "detections": []}

    def predict_from_path(image_path):
        """Run detection from an image path"""
        try:
            image = Image.open(image_path)
            return run_inference(image)
        except Exception as e:
            return {"success": False, "error": str(e), "detections": []}
    
    if __name__ == "__main__":
        # Support two modes:
        # 1) One-shot: pass image path as argv[1] or provide base64 on stdin.
        # 2) Persistent worker mode: run with `--persistent` and then send JSON lines
        #    to stdin like {"id":"uuid","image":"<base64>","conf":0.01} and
        #    receive JSON line responses per request.
        persistent = '--persistent' in sys.argv

        if persistent:
            # Line-based JSON protocol for persistent worker
            try:
                for raw in sys.stdin:
                    raw = raw.strip()
                    if not raw:
                        continue
                    try:
                        req = json.loads(raw)
                        req_id = req.get('id')
                        img_b64 = req.get('image')
                        conf = float(req.get('conf', MODEL_CONFIDENCE))
                        iou = float(req.get('iou', MODEL_IOU))

                        # Temporarily override model params for this request
                        prev_conf, prev_iou = MODEL_CONFIDENCE, MODEL_IOU
                        try:
                            MODEL_CONFIDENCE = conf
                            MODEL_IOU = iou
                            res = predict(img_b64)
                        finally:
                            MODEL_CONFIDENCE, MODEL_IOU = prev_conf, prev_iou

                        # attach id and print one JSON line
                        if isinstance(res, dict):
                            res['id'] = req_id
                        else:
                            res = { 'success': False, 'error': 'Invalid result', 'id': req_id }
                        sys.stdout.write(json.dumps(res, ensure_ascii=False) + '\n')
                        sys.stdout.flush()
                    except Exception as re:
                        err = { 'success': False, 'error': str(re), 'id': req.get('id') if isinstance(req, dict) else None }
                        sys.stdout.write(json.dumps(err, ensure_ascii=False) + '\n')
                        sys.stdout.flush()
            except Exception as e:
                print(json.dumps({"success": False, "error": str(e)}))
        else:
            # If image path is passed by Node.js, use it.
            # Otherwise fallback to reading base64 from stdin.
            if len(sys.argv) > 1 and sys.argv[1].strip():
                result = predict_from_path(sys.argv[1].strip())
            else:
                image_b64 = sys.stdin.read().strip()
                if not image_b64:
                    result = {"success": False, "error": "No image input provided", "detections": []}
                else:
                    result = predict(image_b64)

            print(json.dumps(result))
        
except ImportError as e:
    print(json.dumps({"success": False, "error": f"Missing dependency: {e}"}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
