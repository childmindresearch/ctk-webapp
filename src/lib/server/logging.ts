import winston from "winston"

const { combine, timestamp, json } = winston.format
export const logger = winston.createLogger({
  level: "debug",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS"
    }),
    json()
  ),
  transports: [new winston.transports.Console()]
})
