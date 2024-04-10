import pkg from "pg"
const { Pool } = pkg
import { env } from "$env/dynamic/private"

const config = {
    host: env.POSTGRES_HOST,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    port: Number(env.POSTGRES_PORT),
    ssl: true
}

export const pool = new Pool(config)

export interface SqlDiagnosisModel {
    id: number
    text: string
    parent_id: number | null
    time_created: string
    time_updated: string
}

export interface SqlDiagnosisSchema {
    id: number
    text: string
    parent_id: number | null
}
