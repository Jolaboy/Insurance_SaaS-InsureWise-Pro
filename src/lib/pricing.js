function clampNumber(value, { min = -Infinity, max = Infinity, fallback = 0 } = {}) {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

// Simple, transparent, deterministic pricing model for instant quotes.
// This is not actuarial pricing; it is a safe placeholder for an MVP.
export function priceInstantQuote({ product, inputs }) {
  const now = new Date().toISOString()
  const currency = inputs?.currency ?? 'GBP'

  if (product === 'auto') {
    const driverAge = clampNumber(inputs.driverAge, { min: 16, max: 99, fallback: 30 })
    const vehicleYear = clampNumber(inputs.vehicleYear, { min: 1990, max: new Date().getFullYear() + 1, fallback: 2018 })
    const annualMiles = clampNumber(inputs.annualMiles, { min: 1000, max: 50000, fallback: 12000 })
    const incidents = clampNumber(inputs.incidents, { min: 0, max: 10, fallback: 0 })

    const ageFactor = driverAge < 25 ? 1.45 : driverAge < 70 ? 1.0 : 1.15
    const vehicleAge = Math.max(0, new Date().getFullYear() - vehicleYear)
    const vehicleFactor = vehicleAge <= 5 ? 1.05 : vehicleAge <= 12 ? 1.0 : 1.1
    const milesFactor = annualMiles <= 8000 ? 0.9 : annualMiles <= 15000 ? 1.0 : 1.15
    const incidentFactor = 1.0 + Math.min(0.6, incidents * 0.15)

    const baseMonthly = 11000 // $110.00
    const monthly = Math.round(baseMonthly * ageFactor * vehicleFactor * milesFactor * incidentFactor)
    return {
      priced_at: now,
      monthly_premium_cents: monthly,
      annual_premium_cents: monthly * 12,
      currency,
      model: 'mvp-auto-v1',
    }
  }

  if (product === 'home') {
    const homeValue = clampNumber(inputs.homeValue, { min: 50000, max: 2000000, fallback: 350000 })
    const homeYearBuilt = clampNumber(inputs.homeYearBuilt, { min: 1900, max: new Date().getFullYear(), fallback: 2005 })
    const hasSecurity = Boolean(inputs.hasSecurity)
    const claims = clampNumber(inputs.claims, { min: 0, max: 10, fallback: 0 })

    const age = Math.max(0, new Date().getFullYear() - homeYearBuilt)
    const ageFactor = age <= 15 ? 0.95 : age <= 40 ? 1.0 : 1.15
    const securityFactor = hasSecurity ? 0.92 : 1.0
    const claimsFactor = 1.0 + Math.min(0.6, claims * 0.18)

    const baseMonthly = 6500 // $65.00
    const valueFactor = Math.max(0.8, Math.min(2.2, homeValue / 300000))

    const monthly = Math.round(baseMonthly * valueFactor * ageFactor * securityFactor * claimsFactor)
    return {
      priced_at: now,
      monthly_premium_cents: monthly,
      annual_premium_cents: monthly * 12,
      currency,
      model: 'mvp-home-v1',
    }
  }

  // bundle
  const auto = priceInstantQuote({ product: 'auto', inputs: inputs.auto ?? inputs })
  const home = priceInstantQuote({ product: 'home', inputs: inputs.home ?? inputs })
  const discountedMonthly = Math.round((auto.monthly_premium_cents + home.monthly_premium_cents) * 0.92) // 8% bundle discount
  return {
    priced_at: now,
    monthly_premium_cents: discountedMonthly,
    annual_premium_cents: discountedMonthly * 12,
    currency,
    model: 'mvp-bundle-v1',
    breakdown: {
      auto_monthly_cents: auto.monthly_premium_cents,
      home_monthly_cents: home.monthly_premium_cents,
      discount: '8%',
    },
  }
}
