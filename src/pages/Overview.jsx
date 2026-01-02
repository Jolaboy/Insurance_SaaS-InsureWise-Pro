import { useAuth } from '../auth/authContext'

export default function Overview() {
  const { user } = useAuth()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
      <div className="bg-white border rounded-xl p-6">
        <p className="text-gray-700">Welcome back{user?.email ? `, ${user.email}` : ''}.</p>
        <p className="text-sm text-gray-600 mt-2">
          Use the sidebar to view your policies, review quotes, and update settings.
        </p>
      </div>
    </div>
  )
}
