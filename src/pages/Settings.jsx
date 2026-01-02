import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import { supabase } from '../lib/supabaseClient'

export default function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function onSignOut() {
    setBusy(true)
    setError(null)
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
      setBusy(false)
      return
    }
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

      <div className="bg-white border rounded-xl p-6 space-y-3">
        <div>
          <div className="text-sm text-gray-600">Signed in as</div>
          <div className="text-gray-900 font-medium">{user?.email ?? 'Unknown'}</div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button
          type="button"
          disabled={busy}
          onClick={onSignOut}
          className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
