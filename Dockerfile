FROM node:22 as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build



CMD ["node", "build/index.js"]
