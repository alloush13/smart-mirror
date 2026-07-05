#!/bin/bash
set -e

mkdir -p /app/infra/nginx/certs

mkcert -install

mkcert -key-file /app/infra/nginx/certs/key.pem \
       -cert-file /app/infra/nginx/certs/cert.pem \
       192.168.1.20 \
       localhost \
       127.0.0.1 \
       smartmirror.local

echo "✅ Certificates generated successfully"