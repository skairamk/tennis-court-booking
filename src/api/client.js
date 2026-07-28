// Thin fetch wrapper around the Express API. Vite proxies /api to the
// backend in dev; in production the same Express process serves both,
// so relative URLs work in both environments without configuration.
async function request(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`)
  }
  return data
}

export function fetchCourts() {
  return request('/courts')
}

export function fetchAvailability(courtId, date) {
  return request(`/bookings/availability?courtId=${encodeURIComponent(courtId)}&date=${encodeURIComponent(date)}`)
}

export function fetchMyBookings() {
  return request('/bookings/mine')
}

export function createBooking(payload) {
  return request('/bookings', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteBooking(id) {
  return request(`/bookings/${id}`, { method: 'DELETE' })
}
