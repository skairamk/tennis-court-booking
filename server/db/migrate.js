import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../db.js'
import { courts } from '../../src/data/mockCourts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  console.log('Applying schema...')
  await pool.query(schema)

  console.log(`Seeding ${courts.length} courts...`)
  for (const court of courts) {
    await pool.query(
      `INSERT INTO courts (id, name, location, surface, setting, price_per_hour, open_hour, close_hour, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         location = EXCLUDED.location,
         surface = EXCLUDED.surface,
         setting = EXCLUDED.setting,
         price_per_hour = EXCLUDED.price_per_hour,
         open_hour = EXCLUDED.open_hour,
         close_hour = EXCLUDED.close_hour,
         description = EXCLUDED.description`,
      [
        court.id,
        court.name,
        court.location,
        court.surface,
        court.setting,
        court.pricePerHour,
        court.openHour,
        court.closeHour,
        court.description,
      ],
    )
  }

  console.log('Done.')
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
