# Use the official Node.js image as the base image
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build


FROM node:22-alpine3.21

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

RUN addgroup -S app && adduser -S app -G app
USER app

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]