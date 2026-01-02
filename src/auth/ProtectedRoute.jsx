import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './authContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="p-6 text-sm text-gray-600">Loading…</div>

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
