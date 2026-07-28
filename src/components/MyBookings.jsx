import { Link } from 'react-router-dom'
import { useBookings } from '../context/BookingsContext.jsx'
import BookingCard from './BookingCard.jsx'

export default function MyBookings() {
  const { bookings, loading, error, cancelBooking } = useBookings()

  const sorted = [...bookings].sort((a, b) => {
    const aKey = `${a.dateKey}T${a.slot}`
    const bKey = `${b.dateKey}T${b.slot}`
    return aKey.localeCompare(bKey)
  })

  const now = new Date()
  const upcoming = sorted.filter((b) => new Date(`${b.dateKey}T${b.slot}`) >= now)
  const past = sorted.filter((b) => new Date(`${b.dateKey}T${b.slot}`) < now)

  return (
    <section>
      <div className="page-intro">
        <h1>My Bookings</h1>
        <p>Courts you've booked under your account.</p>
      </div>

      {error && <p className="banner banner--error">Couldn't load bookings: {error}</p>}

      {loading ? (
        <p className="empty-state">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p>You haven't booked a court yet.</p>
          <Link className="btn btn--primary" to="/">
            Find a court
          </Link>
        </div>
      ) : (
        <>
          <h2 className="section-heading">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="empty-state">No upcoming bookings.</p>
          ) : (
            <div className="booking-list">
              {upcoming.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onCancel={cancelBooking} />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <>
              <h2 className="section-heading">Past</h2>
              <div className="booking-list booking-list--past">
                {past.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onCancel={cancelBooking} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
