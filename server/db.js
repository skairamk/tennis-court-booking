import pg from 'pg'

const { Pool, types } = pg

// Return DATE columns as plain "YYYY-MM-DD" strings instead of JS Date
// objects, so we don't have to fight timezone conversion when comparing
// against the dateKey strings the frontend sends.
types.setTypeParser(1082, (val) => val)

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.')
}

// Neon requires SSL. Most Neon connection strings already include
// `?sslmode=require`, but we set it explicitly so this also works
// against a local Postgres without SSL configured.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=disable')
    ? false
    : { rejectUnauthorized: false },
})

export function query(text, params) {
  return pool.query(text, params)
}
