FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package.json if needed
COPY package*.json ./

# Copy frontend package.json separately
COPY frontend/package*.json ./frontend/

# Install root deps if any
RUN npm ci

# Install frontend deps
RUN npm ci --prefix frontend

# Copy all source code
COPY . ./

# Build frontend
RUN npm run build --prefix frontend
