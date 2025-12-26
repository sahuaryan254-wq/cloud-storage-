# Base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install root deps if any
RUN npm ci

# Install frontend deps
RUN npm ci --prefix frontend

# Copy source code
COPY . ./

# Build frontend
RUN npm run build --prefix frontend

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built frontend
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/package*.json ./

# Install production deps only
RUN npm ci --production

# Expose port 4300
EXPOSE 4300

# Start app
CMD ["npm", "start", "--prefix", "."]
