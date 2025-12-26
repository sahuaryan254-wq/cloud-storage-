# ---------- BUILD STAGE ----------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/

RUN npm ci
RUN npm ci --prefix frontend

COPY . .

RUN npm run build --prefix frontend


# ---------- RUN STAGE ----------
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Only copy required things from builder
COPY --from=builder /app/frontend ./frontend
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev --prefix frontend

EXPOSE 3000

CMD ["npm", "run", "start", "--prefix", "frontend"]
