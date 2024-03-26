import { getDatabase } from "$lib/server/sql"
import type { SqlDiagnosisSchema } from "$lib/server/sql"

export async function load() {
  const database = getDatabase()
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      database.all("SELECT * FROM diagnoses", (err, rows) => {
        if (err) {
          reject(err)
        } else {
          const typedRows = rows as SqlDiagnosisSchema[]
          resolve({ diagnoses: typedRows })
        }
      })
    })
    database.close()
  })
}
