import { createContext, useContext, useEffect, useState } from 'react'
import { fetchCourts } from '../api/client.js'

const CourtsContext = createContext(null)

export function CourtsProvider({ children }) {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCourts()
      .then(setCourts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <CourtsContext.Provider value={{ courts, loading, error }}>{children}</CourtsContext.Provider>
  )
}

export function useCourts() {
  const ctx = useContext(CourtsContext)
  if (!ctx) throw new Error('useCourts must be used within a CourtsProvider')
  return ctx
}
