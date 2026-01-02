import { useEffect, useMemo, useState } from 'react'

function buildGmailComposeUrl(email) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`
}

export default function Footer() {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'amsjarju99@gmail.com'
  const year = new Date().getFullYear()

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(id)
  }, [])

  const nowLabel = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now)
  }, [now])

  return (
    <footer className="border-t bg-white">
      <div className="px-8 py-4 text-xs text-gray-600 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div className="font-semibold">
          © {year} Amadou Jarju
          <span className="mx-2 text-gray-300">|</span>
          <a
            className="text-blue-700 hover:underline font-semibold"
            href={buildGmailComposeUrl(supportEmail)}
            target="_blank"
            rel="noreferrer"
          >
            {supportEmail}
          </a>
        </div>
        <div className="text-gray-500 font-semibold">{nowLabel}</div>
      </div>
    </footer>
  )
}
