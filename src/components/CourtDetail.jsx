import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useCourts } from '../context/CourtsContext.jsx'
import { useBookings } from '../context/BookingsContext.jsx'
import { authClient } from '../lib/authClient.js'
import { fetchAvailability } from '../api/client.js'
import {
  formatDayLabel,
  formatSlotLabel,
  getHourlySlots,
  getUpcomingDays,
  isSlotInPast,
  toDateKey,
} from '../utils/dateHelpers.js'
import BookingModal from './BookingModal.jsx'

export default function CourtDetail() {
  const { id } = useParams()
  const location = useLocation()
  const { courts, loading: courtsLoading } = useCourts()
  const { addBooking } = useBookings()
  const { data: session } = authClient.useSession()

  const court = courts.find((c) => c.id === id)
  const days = getUpcomingDays(7)
  const [selectedDay, setSelectedDay] = useState(days[0])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])

  const dateKey = toDateKey(selectedDay)

  useEffect(() => {
    if (!court) return
    let cancelled = false
    fetchAvailability(court.id, dateKey)
      .then((slots) => {
        if (!cancelled) setBookedSlots(slots)
      })
      .catch(() => {
        if (!cancelled) setBookedSlots([])
      })
    return () => {
      cancelled = true
    }
  }, [court, dateKey])

  if (!court) {
    return (
      <section>
        <p className="empty-state">{courtsLoading ? 'Loading court…' : 'Court not found.'}</p>
        {!courtsLoading && (
          <Link className="btn btn--primary" to="/">
            Back to courts
          </Link>
        )}
      </section>
    )
  }

  const slots = getHourlySlots(court.openHour, court.closeHour)

  function handleSlotClick(slot) {
    if (!session) return
    setSelectedSlot(slot)
  }

  async function handleConfirm() {
    const result = await addBooking({ courtId: court.id, dateKey, slot: selectedSlot })
    if (result.ok) {
      setSelectedSlot(null)
      setConfirmation({ date: selectedDay, slot: result.booking.slot })
      setBookedSlots((prev) => [...prev, result.booking.slot])
    }
    return result
  }

  return (
    <section>
      <Link className="back-link" to="/">
        ← All courts
      </Link>

      <div className="page-intro">
        <h1>{court.name}</h1>
        <p>
          {court.location} · {court.surface} · {court.setting} · ${court.pricePerHour}/hr
        </p>
        <p>{court.description}</p>
      </div>

      {!session && (
        <div className="banner">
          <Link to={`/sign-in?redirect=${encodeURIComponent(location.pathname)}`}>Sign in</Link> to book a
          time on this court.
        </div>
      )}

      {confirmation && (
        <div className="banner banner--success">
          Booked! {formatDayLabel(confirmation.date)} at {formatSlotLabel(confirmation.slot)}.{' '}
          <Link to="/bookings">View my bookings</Link>
        </div>
      )}

      <div className="day-picker">
        {days.map((day) => {
          const key = toDateKey(day)
          const isSelected = key === dateKey
          return (
            <button
              key={key}
              type="button"
              className={`day-pill ${isSelected ? 'day-pill--selected' : ''}`}
              onClick={() => {
                setSelectedDay(day)
                setConfirmation(null)
              }}
            >
              {formatDayLabel(day)}
            </button>
          )
        })}
      </div>

      <div className="slot-grid">
        {slots.map((slot) => {
          const booked = bookedSlots.includes(slot)
          const past = isSlotInPast(dateKey, slot)
          const disabled = booked || past || !session
          return (
            <button
              key={slot}
              type="button"
              className={`slot ${booked ? 'slot--booked' : ''} ${past ? 'slot--past' : ''}`}
              disabled={disabled}
              onClick={() => handleSlotClick(slot)}
              title={
                booked
                  ? 'Already booked'
                  : past
                    ? 'This time has passed'
                    : !session
                      ? 'Sign in to book'
                      : 'Available'
              }
            >
              {formatSlotLabel(slot)}
            </button>
          )
        })}
      </div>

      {selectedSlot && (
        <BookingModal
          court={court}
          date={selectedDay}
          slot={selectedSlot}
          onConfirm={handleConfirm}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </section>
  )
}
