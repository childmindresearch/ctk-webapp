import { env } from "$env/dynamic/private"

export const POSTGRES_HOST = env.POSTGRES_HOST
export const POSTGRES_USER = env.POSTGRES_USER
export const POSTGRES_PASSWORD = env.POSTGRES_PASSWORD
export const POSTGRES_DB = env.POSTGRES_DB
export const POSTGRES_PORT = Number(env.POSTGRES_PORT)
export const POSTGRES_SSL = env.POSTGRES_SSL != "false"

export let DATABASE_URL = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`
if (!POSTGRES_SSL) {
    DATABASE_URL += "?sslmode=disable"
} else {
    DATABASE_URL += "?sslmode=require"
}

export const AZURE_FUNCTION_PYTHON_URL = env.AZURE_FUNCTION_PYTHON_URL
export const LANGUAGETOOL_URL = env.LANGUAGETOOL_URL

export const DEVELOPMENT_USER = env.DEVELOPMENT_USER
