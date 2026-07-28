import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createBooking, deleteBooking, fetchMyBookings } from '../api/client.js'
import { authClient } from '../lib/authClient.js'

const BookingsContext = createContext(null)

export function BookingsProvider({ children }) {
  const { data: session } = authClient.useSession()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(() => {
    if (!session) {
      setBookings([])
      setLoading(false)
      return Promise.resolve()
    }
    setLoading(true)
    return fetchMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [session])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addBooking = useCallback(async ({ courtId, dateKey, slot }) => {
    try {
      const booking = await createBooking({ courtId, dateKey, slot })
      setBookings((prev) => [...prev, booking])
      return { ok: true, booking }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }, [])

  const cancelBooking = useCallback(
    async (id) => {
      const previous = bookings
      setBookings((prev) => prev.filter((b) => b.id !== id))
      try {
        await deleteBooking(id)
      } catch (err) {
        setBookings(previous)
        setError(err.message)
      }
    },
    [bookings],
  )

  const value = useMemo(
    () => ({ bookings, loading, error, addBooking, cancelBooking, refresh }),
    [bookings, loading, error, addBooking, cancelBooking, refresh],
  )

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>
}

export function useBookings() {
  const ctx = useContext(BookingsContext)
  if (!ctx) throw new Error('useBookings must be used within a BookingsProvider')
  return ctx
}
