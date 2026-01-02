import { supabase } from './supabaseClient'

export async function createQuote({ userId, product, inputs, pricing }) {
  return supabase
    .from('quotes')
    .insert({
      user_id: userId,
      product,
      status: 'quoted',
      monthly_premium_cents: pricing.monthly_premium_cents,
      annual_premium_cents: pricing.annual_premium_cents,
      currency: pricing.currency ?? 'USD',
      inputs,
    })
    .select('*')
    .single()
}

export async function listQuotes() {
  return supabase
    .from('quotes')
    .select('id, product, status, monthly_premium_cents, annual_premium_cents, currency, created_at')
    .order('created_at', { ascending: false })
}

export async function acceptQuote({ quoteId }) {
  return supabase
    .from('quotes')
    .update({ status: 'accepted' })
    .eq('id', quoteId)
    .select('*')
    .single()
}

export async function getQuoteById({ quoteId }) {
  return supabase.from('quotes').select('*').eq('id', quoteId).single()
}
