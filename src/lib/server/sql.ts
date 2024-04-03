import pkg from "pg"
const { Pool } = pkg
import { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_DB, POSTGRES_HOST } from "$lib/server/secrets"

const config = {
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    port: Number(POSTGRES_PORT),
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
