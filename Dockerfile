FROM node:22-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:22-slim

WORKDIR /app

COPY --from=builder /app/build /app/build
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/drizzle /app/drizzle
RUN npm ci --omit=dev
EXPOSE 3000

CMD ["node", "build/index.js"]
