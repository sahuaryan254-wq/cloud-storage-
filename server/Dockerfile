FROM node:18-alpine
WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source
COPY . .

EXPOSE 5000
ENV NODE_ENV=production
CMD ["npm", "start"]
