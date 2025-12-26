FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . ./

# Install next globally (optional) and build
RUN npm install -g next
RUN npm run build --prefix frontend
