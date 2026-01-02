import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, fontFamily: 'Helvetica' },
  title: { fontSize: 16, marginBottom: 12 },
  card: { border: '1pt solid #111827', borderRadius: 8, padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: '#6b7280' },
  value: { color: '#111827' },
  small: { fontSize: 10, color: '#6b7280', marginTop: 10 },
})

export default function InsuranceIdCard({ policy }) {
  const product = policy?.product ?? policy?.plan_type ?? 'Policy'
  const status = policy?.status ?? 'active'
  const policyId = policy?.id ?? ''

  const currency = policy?.currency ?? 'GBP'
  const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$'
  const monthly = typeof policy?.monthly_premium_cents === 'number' ? (policy.monthly_premium_cents / 100).toFixed(2) : null
  const annual = typeof policy?.annual_premium_cents === 'number' ? (policy.annual_premium_cents / 100).toFixed(2) : null

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Insurance ID Card</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Provider</Text>
            <Text style={styles.value}>InsureWise Pro</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Policy</Text>
            <Text style={styles.value}>{product}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Policy ID</Text>
            <Text style={styles.value}>{policyId}</Text>
          </View>
          {(monthly || annual) && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Monthly premium</Text>
                <Text style={styles.value}>{monthly ? `${symbol}${monthly}` : '-'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Annual premium</Text>
                <Text style={styles.value}>{annual ? `${symbol}${annual}` : '-'}</Text>
              </View>
            </>
          )}
        </View>

        <Text style={styles.small}>
          This document is for demonstration purposes only. Replace with your real carrier wording and legal disclosures.
        </Text>
      </Page>
    </Document>
  )
}
