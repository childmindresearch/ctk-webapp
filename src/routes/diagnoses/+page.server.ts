import { getDatabase } from "$lib/server/sql"
import type { SqlDiagnosisSchema } from "$lib/server/sql"

export async function load() {
  const database = getDatabase()
  return { diagnoses: (await database`SELECT * FROM diagnoses`) as SqlDiagnosisSchema[] }
}
