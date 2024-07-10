FROM node:22 as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22

WORKDIR /app

COPY --from=builder /app/build /app/build
COPY --from=builder /app/package*.json /app/

EXPOSE 3000

CMD ["node", "build/index.js"]
