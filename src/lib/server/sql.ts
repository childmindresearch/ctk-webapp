import postgres from "postgres"
import { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_DB, POSTGRES_HOST } from "$lib/server/secrets"

export function getDatabase() {
  return postgres({
    host: POSTGRES_HOST,
    port: Number(POSTGRES_PORT),
    database: POSTGRES_DB,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    ssl: true
  })
}

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
