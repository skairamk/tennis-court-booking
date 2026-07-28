import { Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import CourtList from './components/CourtList.jsx'
import CourtDetail from './components/CourtDetail.jsx'
import MyBookings from './components/MyBookings.jsx'
import SignIn from './components/SignIn.jsx'
import SignUp from './components/SignUp.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import './App.css'

export default function App() {
  return (
    <>
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<CourtList />} />
          <Route path="/courts/:id" element={<CourtDetail />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="*" element={<p className="empty-state">Page not found.</p>} />
        </Routes>
      </main>
    </>
  )
}
