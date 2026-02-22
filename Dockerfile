FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
# Only copy what's needed to run
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public

# Run as non-root user for security
RUN chown -R node:node /app
USER node

EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "server/index.js"]
