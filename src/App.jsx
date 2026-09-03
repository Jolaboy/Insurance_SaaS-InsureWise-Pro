import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Policies from './pages/Policies'
import PolicyDetail from './pages/PolicyDetail'
import Quotes from './pages/Quotes'
import ResetPassword from './pages/ResetPassword'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="policies" element={<Policies />} />
          <Route path="policies/:policyId" element={<PolicyDetail />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
