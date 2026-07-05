FROM ubuntu:22.04

WORKDIR /app

RUN apt update && apt install -y \
    curl \
    libnss3-tools \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# install mkcert
RUN curl -L "https://dl.filippo.io/mkcert/latest?for=linux/amd64" -o mkcert \
    && chmod +x mkcert \
    && mv mkcert /usr/local/bin/mkcert

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]