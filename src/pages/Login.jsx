import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import { supabase } from '../lib/supabaseClient'
import Footer from '../components/Footer.jsx'

export default function Login() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = useMemo(() => {
    const from = location.state?.from?.pathname
    return typeof from === 'string' ? from : '/dashboard'
  }, [location.state])

  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true })
  }, [user, navigate, redirectTo])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        navigate(redirectTo, { replace: true })
        return
      }

      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError

      setMode('signin')
      setError('Account created. Please check your email to confirm, then sign in.')
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border rounded-xl p-6">
        <h1 className="text-xl font-semibold text-gray-900">InsureWise Pro</h1>
        <p className="text-sm text-gray-600 mt-1">Sign in to your client portal</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={6}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-60"
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-700">
          {mode === 'signin' ? (
            <button type="button" className="text-blue-700 hover:underline" onClick={() => setMode('signup')}>
              Need an account? Sign up
            </button>
          ) : (
            <button type="button" className="text-blue-700 hover:underline" onClick={() => setMode('signin')}>
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>

      </div>

      <Footer />
    </div>
  )
}
