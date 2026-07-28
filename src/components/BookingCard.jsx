import { Link } from 'react-router-dom'
import { formatDayLabel, formatSlotLabel } from '../utils/dateHelpers.js'

export default function BookingCard({ booking, onCancel }) {
  const date = new Date(`${booking.dateKey}T00:00:00`)

  return (
    <div className="booking-card">
      <div>
        <h3>{booking.courtName}</h3>
        <p>
          {formatDayLabel(date)} · {formatSlotLabel(booking.slot)}
        </p>
        <p className="booking-card__meta">
          Booked for {booking.playerName} · ${booking.pricePerHour}
        </p>
      </div>
      <div className="booking-card__actions">
        <Link className="btn btn--ghost" to={`/courts/${booking.courtId}`}>
          View court
        </Link>
        <button type="button" className="btn btn--danger" onClick={() => onCancel(booking.id)}>
          Cancel
        </button>
      </div>
    </div>
  )
}
