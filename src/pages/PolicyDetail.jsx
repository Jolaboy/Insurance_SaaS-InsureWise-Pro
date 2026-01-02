import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { formatMoneyFromCents } from '../lib/money'
import { getPolicyById } from '../lib/policyApi'
import InsuranceIdCard from '../pdfs/InsuranceIdCard'

export default function PolicyDetail() {
  const { policyId } = useParams()
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const stripePaymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await getPolicyById({ policyId })
      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
        setPolicy(null)
      } else {
        setPolicy(data)
      }

      setLoading(false)
    }

    load()
    return () => {
      isMounted = false
    }
  }, [policyId])

  const filename = useMemo(() => `insurance-id-card-${policyId}.pdf`, [policyId])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Policy details</h1>
          <div className="text-sm text-gray-600 mt-1">
            <Link className="text-blue-700 hover:underline" to="/dashboard/policies">
              ← Back to policies
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border rounded-xl p-6 text-gray-700">Loading…</div>
      ) : error ? (
        <div className="bg-white border rounded-xl p-6 text-red-600">{error}</div>
      ) : !policy ? (
        <div className="bg-white border rounded-xl p-6 text-gray-700">Policy not found.</div>
      ) : (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="Policy ID" value={policy.id} />
            <Info label="Status" value={policy.status ?? '-'} />
            <Info label="Product" value={policy.product ?? policy.plan_type ?? '-'} />
            <Info label="Plan" value={policy.plan_type ?? '-'} />
            <Info label="Monthly" value={formatMoneyFromCents(policy.monthly_premium_cents ?? 0, policy.currency ?? 'GBP')} />
            <Info label="Annual" value={formatMoneyFromCents(policy.annual_premium_cents ?? 0, policy.currency ?? 'GBP')} />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <PDFDownloadLink document={<InsuranceIdCard policy={policy} />} fileName={filename}>
              {({ loading: pdfLoading }) => (
                <button
                  type="button"
                  className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60"
                  disabled={pdfLoading}
                >
                  {pdfLoading ? 'Preparing PDF…' : 'Download Insurance ID (PDF)'}
                </button>
              )}
            </PDFDownloadLink>

            <a
              href={stripePaymentLink || '#'}
              target="_blank"
              rel="noreferrer"
              className={`text-sm px-4 py-2 rounded-lg border ${
                stripePaymentLink ? 'border-blue-600 text-blue-700 hover:bg-blue-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (!stripePaymentLink) e.preventDefault()
              }}
            >
              Pay premium
            </a>

            {!stripePaymentLink && (
              <div className="text-xs text-gray-500">Set VITE_STRIPE_PAYMENT_LINK to enable payments.</div>
            )}
          </div>

          {policy.coverage && (
            <div className="border rounded-xl p-4">
              <div className="font-medium text-gray-900">Coverage (raw)</div>
              <pre className="text-xs text-gray-700 mt-2 overflow-x-auto">{JSON.stringify(policy.coverage, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-sm font-medium text-gray-900 break-all">{value}</div>
    </div>
  )
}
