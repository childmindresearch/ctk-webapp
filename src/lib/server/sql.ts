import pkg from "pg"
import { POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT } from "./environment"

const { Pool } = pkg
const config = {
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    port: Number(POSTGRES_PORT),
    ssl: true
}

export const pool = new Pool(config)

export interface SqlTemplateModel {
    id: number
    text: string
    parent_id: number | null
    time_created: string
    time_updated: string
}

export interface SqlTemplateSchema {
    id: number
    text: string
    parent_id: number | null
}
