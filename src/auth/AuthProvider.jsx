import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const hasSupabase = useMemo(
    () => Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    [],
  )

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => hasSupabase)

  useEffect(() => {
    if (!hasSupabase) {
      return
    }

    let isMounted = true

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) console.error(error)
        setUser(data?.session?.user ?? null)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        if (!isMounted) return
        setUser(null)
        setLoading(false)
      })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [hasSupabase])

  const value = useMemo(() => ({ user, loading }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div className="p-6 text-sm text-gray-600">Loading…</div> : children}
    </AuthContext.Provider>
  )
}
