import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { formatMoneyFromCents } from '../lib/money'
import { priceInstantQuote } from '../lib/pricing'
import { acceptQuote, createQuote, getQuoteById, listQuotes } from '../lib/quoteApi'
import { createPolicyFromQuote } from '../lib/policyApi'

export default function Quotes() {
  const { user } = useAuth()

  const [product, setProduct] = useState('bundle')
  const [currency, setCurrency] = useState('GBP')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  const [autoInputs, setAutoInputs] = useState({
    driverAge: 30,
    vehicleYear: 2018,
    annualMiles: 12000,
    incidents: 0,
  })
  const [homeInputs, setHomeInputs] = useState({
    homeValue: 350000,
    homeYearBuilt: 2005,
    hasSecurity: true,
    claims: 0,
  })

  const preview = useMemo(() => {
    const inputs =
      product === 'bundle'
        ? { auto: autoInputs, home: homeInputs, currency }
        : product === 'auto'
          ? { ...autoInputs, currency }
          : { ...homeInputs, currency }
    return priceInstantQuote({ product, inputs })
  }, [product, autoInputs, homeInputs, currency])

  async function refresh() {
    setLoading(true)
    const { data, error: listError } = await listQuotes()
    if (listError) {
      setError(listError.message)
      setQuotes([])
    } else {
      setQuotes(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function onCreateQuote(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const inputs =
        product === 'bundle'
          ? { auto: autoInputs, home: homeInputs, currency }
          : product === 'auto'
            ? { ...autoInputs, currency }
            : { ...homeInputs, currency }
      const pricing = priceInstantQuote({ product, inputs })

      const { error: insertError } = await createQuote({
        userId: user?.id,
        product,
        inputs,
        pricing,
      })

      if (insertError) throw insertError
      await refresh()
    } catch (err) {
      setError(err?.message ?? 'Failed to create quote.')
    } finally {
      setSubmitting(false)
    }
  }

  async function onAccept(quoteId) {
    setError(null)
    setSubmitting(true)
    try {
      const { data: fullQuote, error: fetchError } = await getQuoteById({ quoteId })
      if (fetchError) throw fetchError

      const { error: acceptError } = await acceptQuote({ quoteId })
      if (acceptError) throw acceptError

      const { error: policyError } = await createPolicyFromQuote({ userId: user?.id, quote: fullQuote })
      if (policyError) throw policyError

      await refresh()
    } catch (err) {
      setError(err?.message ?? 'Failed to accept quote.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-600 mt-1">Instant Auto + Home quotes (and bundles) with a transparent MVP pricing model.</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Estimated monthly</div>
          <div className="text-xl font-semibold text-gray-900">{formatMoneyFromCents(preview.monthly_premium_cents, preview.currency)}</div>
          <div className="text-xs text-gray-500">Annual {formatMoneyFromCents(preview.annual_premium_cents, preview.currency)}</div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <form className="space-y-6" onSubmit={onCreateQuote}>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Product</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="auto">Auto</option>
              <option value="home">Home</option>
              <option value="bundle">Bundle (Auto + Home)</option>
            </select>

            <label className="text-sm font-medium text-gray-700 ml-0 md:ml-3">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
              <option value="GBP">GBP (£)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          {(product === 'auto' || product === 'bundle') && (
            <div className="border rounded-xl p-4">
              <div className="font-medium text-gray-900">Auto details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Field label="Driver age">
                  <input
                    type="number"
                    min={16}
                    max={99}
                    value={autoInputs.driverAge}
                    onChange={(e) => setAutoInputs((s) => ({ ...s, driverAge: Number(e.target.value) }))}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </Field>
                <Field label="Vehicle year">
                  <input
                    type="number"
                    min={1990}
                    max={new Date().getFullYear() + 1}
                    value={autoInputs.vehicleYear}
                    onChange={(e) => setAutoInputs((s) => ({ ...s, vehicleYear: Number(e.target.value) }))}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </Field>
                <Field label="Annual miles">
                  <input
                    type="number"
                    min={1000}
                    max={50000}
                    value={autoInputs.annualMiles}
                    onChange={(e) => setAutoInputs((s) => ({ ...s, annualMiles: Number(e.target.value) }))}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </Field>
                <Field label="Incidents (3 years)">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={autoInputs.incidents}
                    onChange={(e) => setAutoInputs((s) => ({ ...s, incidents: Number(e.target.value) }))}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </Field>
              </div>
            </div>
          )}

          {(product === 'home' || product === 'bundle') && (
            <div className="border rounded-xl p-4">
              <div className="font-medium text-gray-900">Home details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Field label="Home value (USD)">
                  <input
                    type="number"
                    min={50000}
                    max={2000000}
                    value={homeInputs.homeValue}
                    onChange={(e) => setHomeInputs((s) => ({ ...s, homeValue: Number(e.target.value) }))}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </Field>
                <Field label="Year built">
                  <input
                    type="number"
                    min={1900}
                    max={new Date().getFullYear()}
                    value={homeInputs.homeYearBuilt}
                    onChange={(e) => setHomeInputs((s) => ({ ...s, homeYearBuilt: Number(e.target.value) }))}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </Field>
                <Field label="Claims (5 years)">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={homeInputs.claims}
                    onChange={(e) => setHomeInputs((s) => ({ ...s, claims: Number(e.target.value) }))}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </Field>
                <Field label="Security system">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={homeInputs.hasSecurity}
                      onChange={(e) => setHomeInputs((s) => ({ ...s, hasSecurity: e.target.checked }))}
                    />
                    Has monitored security
                  </label>
                </Field>
              </div>
            </div>
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              Create instant quote
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="font-medium text-gray-900">Quote history</div>
          <div className="text-sm text-gray-600">Your recent quotes from Supabase.</div>
        </div>

        {loading ? (
          <div className="p-6 text-gray-700">Loading…</div>
        ) : quotes.length === 0 ? (
          <div className="p-6 text-gray-700">No quotes yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-medium px-6 py-3">Created</th>
                  <th className="text-left font-medium px-6 py-3">Product</th>
                  <th className="text-left font-medium px-6 py-3">Status</th>
                  <th className="text-left font-medium px-6 py-3">Monthly</th>
                  <th className="text-left font-medium px-6 py-3">Annual</th>
                  <th className="text-left font-medium px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className="border-t">
                    <td className="px-6 py-3 text-gray-700">{new Date(q.created_at).toLocaleString()}</td>
                    <td className="px-6 py-3 text-gray-900">{q.product}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-900">{formatMoneyFromCents(q.monthly_premium_cents, q.currency ?? 'GBP')}</td>
                    <td className="px-6 py-3 text-gray-700">{formatMoneyFromCents(q.annual_premium_cents, q.currency ?? 'GBP')}</td>
                    <td className="px-6 py-3">
                      {q.status === 'quoted' ? (
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => onAccept(q.id)}
                          className="text-xs bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60"
                        >
                          Accept & create policy
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
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

function Field({ label, children }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  )
}
