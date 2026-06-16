FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run" , "dev"]

# FROM node:22-alpine3.21

# WORKDIR /app

# COPY package*.json ./
# RUN npm ci --omit=dev
# COPY proto ./proto
# COPY --from=builder /app/dist ./dist

# RUN addgroup -S app && adduser -S app -G app

# USER app

# EXPOSE 5000

# CMD ["node", "dist/index.js"]