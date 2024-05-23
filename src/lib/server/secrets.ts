import { env } from "$env/dynamic/private"

export const POSTGRES_HOST = env.POSTGRES_HOST
export const POSTGRES_USER = env.POSTGRES_USER
export const POSTGRES_PASSWORD = env.POSTGRES_PASSWORD
export const POSTGRES_DB = env.POSTGRES_DB
export const POSTGRES_PORT = Number(env.POSTGRES_PORT)

export const AZURE_FUNCTION_PYTHON_URL = env.AZURE_FUNCTION_PYTHON_URL
export const AZURE_FUNCTION_PYTHON_KEY = env.AZURE_FUNCTION_PYTHON_KEY

export const AZURE_BLOB_ACCOUNT_NAME = env.AZURE_BLOB_ACCOUNT_NAME
export const AZURE_BLOB_SAS = env.AZURE_BLOB_SAS

export const SHA_256_KEY = env.SHA_256_KEY
