import { supabase } from './supabaseClient'

export async function listPolicies() {
  // Prefer richer columns if they exist; callers should tolerate missing fields.
  return supabase
    .from('policies')
    .select('id, plan_type, status, product, quote_id, monthly_premium_cents, annual_premium_cents, currency, created_at')
    .order('created_at', { ascending: false })
}

export async function getPolicyById({ policyId }) {
  return supabase.from('policies').select('*').eq('id', policyId).single()
}

export async function createPolicyFromQuote({ userId, quote }) {
  const base = {
    user_id: userId,
    plan_type: quote.product === 'bundle' ? 'Auto + Home' : quote.product === 'auto' ? 'Auto' : 'Home',
    status: 'active',
  }

  // Try richer insert first (requires running the SQL upgrade).
  const rich = {
    ...base,
    product: quote.product,
    quote_id: quote.id,
    monthly_premium_cents: quote.monthly_premium_cents,
    annual_premium_cents: quote.annual_premium_cents,
    currency: quote.currency ?? 'GBP',
    coverage: quote.inputs ?? {},
  }

  const attemptRich = await supabase.from('policies').insert(rich).select('*').single()
  if (!attemptRich.error) return attemptRich

  // Fallback for older schemas (only plan_type/status/user_id).
  return supabase.from('policies').insert(base).select('*').single()
}
