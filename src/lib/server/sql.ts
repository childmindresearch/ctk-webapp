import sqlite3 from "sqlite3"
import { DATABASE_URL } from "$lib/server/secrets"

export function getDatabase() {
  if (DATABASE_URL.startsWith("sqlite")) {
    return new sqlite3.Database(DATABASE_URL.split("://")[1])
  }
  throw new Error("Unsupported database")
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
