import { NavLink, useNavigate } from 'react-router-dom'
import { authClient } from '../lib/authClient.js'

export default function Header() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  async function handleSignOut() {
    await authClient.signOut()
    navigate('/')
  }

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <NavLink to="/" className="app-header__brand">
          <span className="app-header__logo" aria-hidden="true">🎾</span>
          <span>CourtSide</span>
        </NavLink>
        <nav className="app-header__nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Find a Court
          </NavLink>
          <NavLink to="/bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
            My Bookings
          </NavLink>
          {session ? (
            <>
              <span className="app-header__user">{session.user.name}</span>
              <button type="button" className="app-header__signout" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/sign-in" className={({ isActive }) => (isActive ? 'active' : '')}>
                Sign in
              </NavLink>
              <NavLink to="/sign-up" className={({ isActive }) => (isActive ? 'active' : '')}>
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
