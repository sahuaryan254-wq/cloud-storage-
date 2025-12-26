<<<<<<< HEAD
# ---------- BUILD STAGE ----------
=======
<<<<<<< HEAD
>>>>>>> 190e317 (fix:next)
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
<<<<<<< HEAD

CMD ["npm", "run", "start", "--prefix", "frontend"]
=======
CMD ["npm", "run", "start"]
=======
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . ./
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/ ./

EXPOSE 3000
CMD ["npm", "run", "start"]
>>>>>>> f1dcdce (fix:next)
>>>>>>> 190e317 (fix:next)
