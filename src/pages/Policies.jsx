import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatMoneyFromCents } from '../lib/money'
import { listPolicies } from '../lib/policyApi'

export default function Policies() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      setError(null)

      // Prefer policyApi so the UI can use richer fields when available.
      const { data, error: queryError } = await listPolicies()

      if (!isMounted) return

      if (queryError) {
        setError(queryError.message)
        setRows([])
      } else {
        setRows(data ?? [])
      }

      setLoading(false)
    }

    load()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Policies</h1>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <p className="text-sm text-gray-600">Policies from your Supabase table `policies` (RLS should restrict to your user).</p>
        </div>

        {loading ? (
          <div className="p-6 text-gray-700">Loading…</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-gray-700">No policies found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-medium px-6 py-3">ID</th>
                  <th className="text-left font-medium px-6 py-3">Product</th>
                  <th className="text-left font-medium px-6 py-3">Plan</th>
                  <th className="text-left font-medium px-6 py-3">Status</th>
                  <th className="text-left font-medium px-6 py-3">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-6 py-3 text-gray-900">
                      <Link className="text-blue-700 hover:underline" to={`/dashboard/policies/${r.id}`}>
                        {r.id}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{r.product ?? '-'}</td>
                    <td className="px-6 py-3 text-gray-700">{r.plan_type ?? '-'}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        {r.status ?? '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {typeof r.monthly_premium_cents === 'number'
                        ? formatMoneyFromCents(r.monthly_premium_cents, r.currency ?? 'GBP')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
