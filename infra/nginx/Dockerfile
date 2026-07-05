# ===== Build React =====
FROM node:20-alpine AS build

WORKDIR /app


ARG VITE_SPEECH_THRESHOLD
ARG VITE_END_OF_SPEECH_MS
ARG VITE_MIN_RECORDING_MS
ARG VITE_SKIN_OVERLAY_DURATION


ENV VITE_SPEECH_THRESHOLD=$VITE_SPEECH_THRESHOLD
ENV VITE_END_OF_SPEECH_MS=$VITE_END_OF_SPEECH_MS
ENV VITE_MIN_RECORDING_MS=$VITE_MIN_RECORDING_MS
ENV VITE_SKIN_OVERLAY_DURATION=$VITE_SKIN_OVERLAY_DURATION

COPY client/package*.json ./
RUN npm install

COPY client/ .

RUN npm run build


# ===== Nginx =====
FROM nginx:alpine

COPY infra/nginx/nginx.conf /etc/nginx/nginx.conf

COPY infra/nginx/certs /etc/nginx/certs

COPY --from=build /app/dist /usr/share/nginx/html