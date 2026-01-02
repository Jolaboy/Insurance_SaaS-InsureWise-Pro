export function formatMoneyFromCents(cents, currency = 'GBP') {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) cents = 0

  // Use locale defaults; currency drives symbol/format.
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

// Backwards compatible helper (still useful in a few spots).
export function formatUsdFromCents(cents) {
  return formatMoneyFromCents(cents, 'USD')
}
