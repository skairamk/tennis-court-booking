import { Navigate, useLocation } from 'react-router-dom'
import { authClient } from '../lib/authClient.js'

export default function ProtectedRoute({ children }) {
  const { data: session, isPending } = authClient.useSession()
  const location = useLocation()

  if (isPending) return <p className="empty-state">Loading…</p>

  if (!session) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/sign-in?redirect=${redirect}`} replace />
  }

  return children
}
