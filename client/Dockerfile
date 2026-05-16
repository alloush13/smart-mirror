# Build stage - Build the React Vite application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build the Vite application
RUN npm run build


# Production stage - Serve with Node.js
FROM node:22-alpine

WORKDIR /app

# Install serve package to serve static files
RUN npm install -g serve

# Copy the built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

# Expose port 3000
EXPOSE 5173

# Start the application
CMD ["serve", "-s", "dist", "-l", "5173"]