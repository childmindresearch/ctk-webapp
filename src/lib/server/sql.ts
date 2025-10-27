import pkg from "pg"
import {
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_PORT,
  POSTGRES_SSL
} from "./environment"

const { Pool } = pkg
const config = {
  host: POSTGRES_HOST,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  port: Number(POSTGRES_PORT),
  ssl: POSTGRES_SSL
}

export const pool = new Pool(config)

export type SqlTemplateSchema = {
  id: number
  text: string
  parent_id: number | null
  priority: number
}

export type SqlDsmCodeSchema = {
  id: number
  code: string
  label: string
}
