export type Detection = {
    bounding_box?: {
        center?: { x?: number; y?: number };
        width?: number;
        height?: number;
    };
    confidence?: number;
    class_id?: number;
    class_name?: string;
};

export type AnalysisResponse = {
    detections?: Detection[];
    count?: number;
};