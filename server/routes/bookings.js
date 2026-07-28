import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/
const SLOT_RE = /^([01]\d|2[0-3]):00$/

function toBookingJSON(row) {
  return {
    id: row.id,
    courtId: row.court_id,
    courtName: row.court_name,
    dateKey: row.date_key,
    slot: row.slot,
    playerName: row.player_name,
    pricePerHour: Number(row.price_per_hour),
    createdAt: row.created_at,
  }
}

const SELECT_WITH_COURT = `
  SELECT b.*, c.name AS court_name
  FROM bookings b
  JOIN courts c ON c.id = b.court_id
`

// Public: which slots are taken for a given court/date. No booker identity
// is exposed here, so this doesn't require sign-in — anyone browsing
// courts can see availability before creating an account.
router.get('/availability', async (req, res, next) => {
  try {
    const { courtId, date } = req.query
    if (!courtId || !DATE_KEY_RE.test(date ?? '')) {
      return res.status(400).json({ error: 'courtId and a valid date are required.' })
    }
    const { rows } = await query('SELECT slot FROM bookings WHERE court_id = $1 AND date_key = $2', [
      courtId,
      date,
    ])
    res.json(rows.map((r) => r.slot))
  } catch (err) {
    next(err)
  }
})

// Auth required: only the signed-in user's own bookings.
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `${SELECT_WITH_COURT} WHERE b.user_id = $1 ORDER BY b.date_key, b.slot`,
      [req.user.id],
    )
    res.json(rows.map(toBookingJSON))
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { courtId, dateKey, slot } = req.body ?? {}

    if (!courtId || !DATE_KEY_RE.test(dateKey ?? '') || !SLOT_RE.test(slot ?? '')) {
      return res.status(400).json({ error: 'courtId, a valid dateKey, and slot are required.' })
    }

    const courtResult = await query('SELECT * FROM courts WHERE id = $1', [courtId])
    const court = courtResult.rows[0]
    if (!court) return res.status(404).json({ error: 'Court not found' })

    const slotHour = Number(slot.slice(0, 2))
    if (slotHour < court.open_hour || slotHour >= court.close_hour) {
      return res.status(400).json({ error: 'That time is outside the court\'s opening hours.' })
    }

    const slotStart = new Date(`${dateKey}T${slot}:00`)
    if (slotStart.getTime() < Date.now()) {
      return res.status(400).json({ error: 'That time has already passed.' })
    }

    const playerName = req.user.name || req.user.email

    const { rows } = await query(
      `INSERT INTO bookings (court_id, user_id, date_key, slot, player_name, price_per_hour)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [courtId, req.user.id, dateKey, slot, playerName, court.price_per_hour],
    )

    res.status(201).json(toBookingJSON({ ...rows[0], court_name: court.name }))
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That slot was just booked by someone else. Pick another.' })
    }
    next(err)
  }
})

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query('DELETE FROM bookings WHERE id = $1 AND user_id = $2 RETURNING id', [
      req.params.id,
      req.user.id,
    ])
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
