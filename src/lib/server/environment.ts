import { env } from "$env/dynamic/private"

export const POSTGRES_HOST = env.POSTGRES_HOST
export const POSTGRES_USER = env.POSTGRES_USER
export const POSTGRES_PASSWORD = env.POSTGRES_PASSWORD
export const POSTGRES_DB = env.POSTGRES_DB
export const POSTGRES_PORT = Number(env.POSTGRES_PORT)
export const POSTGRES_SSL = env.POSTGRES_SSL != "false"

export let DATABASE_URL = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`
if (POSTGRES_HOST === "localhost") {
    DATABASE_URL += "?ssl_mode=disable"
}

export const AZURE_FUNCTION_PYTHON_URL = env.AZURE_FUNCTION_PYTHON_URL

export const DEVELOPMENT_USER = env.DEVELOPMENT_USER
