import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

function toCourtJSON(row) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    surface: row.surface,
    setting: row.setting,
    pricePerHour: Number(row.price_per_hour),
    openHour: row.open_hour,
    closeHour: row.close_hour,
    description: row.description,
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM courts ORDER BY name')
    res.json(rows.map(toCourtJSON))
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM courts WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Court not found' })
    res.json(toCourtJSON(rows[0]))
  } catch (err) {
    next(err)
  }
})

export default router
