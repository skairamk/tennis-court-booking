const DAY_MS = 24 * 60 * 60 * 1000

// Returns an array of Date objects for today + the next `count - 1` days.
export function getUpcomingDays(count = 7) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: count }, (_, i) => new Date(today.getTime() + i * DAY_MS))
}

// Stable, timezone-safe key for a date, e.g. "2026-07-27".
export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDayLabel(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (toDateKey(date) === toDateKey(today)) return 'Today'
  const tomorrow = new Date(today.getTime() + DAY_MS)
  if (toDateKey(date) === toDateKey(tomorrow)) return 'Tomorrow'
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

// Hourly start times between openHour and closeHour, e.g. "07:00".
export function getHourlySlots(openHour, closeHour) {
  const slots = []
  for (let hour = openHour; hour < closeHour; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
  }
  return slots
}

export function formatSlotLabel(slot) {
  const [hourStr] = slot.split(':')
  const hour = Number(hourStr)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:00 ${period}`
}

export function isSlotInPast(dateKey, slot) {
  const [hour] = slot.split(':').map(Number)
  const slotDate = new Date(`${dateKey}T00:00:00`)
  slotDate.setHours(hour, 0, 0, 0)
  return slotDate.getTime() < Date.now()
}
