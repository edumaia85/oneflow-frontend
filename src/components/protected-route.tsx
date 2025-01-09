import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'

export function ProtectedRoute() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
