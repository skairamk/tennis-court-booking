import { useState } from 'react'
import { formatDayLabel, formatSlotLabel } from '../utils/dateHelpers.js'
import { authClient } from '../lib/authClient.js'

export default function BookingModal({ court, date, slot, onConfirm, onClose }) {
  const { data: session } = authClient.useSession()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirmClick() {
    setError('')
    setSubmitting(true)
    const result = await onConfirm()
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="booking-modal-title">Confirm booking</h2>
        <dl className="modal__summary">
          <div>
            <dt>Court</dt>
            <dd>{court.name}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatDayLabel(date)}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{formatSlotLabel(slot)} – 1 hour</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>${court.pricePerHour}</dd>
          </div>
        </dl>

        <p className="modal__booking-as">Booking as {session?.user.name}</p>

        {error && <p className="form-error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={handleConfirmClick} disabled={submitting}>
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
