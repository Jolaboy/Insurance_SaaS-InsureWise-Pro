import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer.jsx'

export default function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [isSidebarHovering, setSidebarHovering] = useState(false)
  const navigate = useNavigate()

  const isSidebarExpanded = isSidebarOpen || isSidebarHovering

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => {
          if (!isSidebarOpen) setSidebarHovering(true)
        }}
        onMouseLeave={() => {
          setSidebarHovering(false)
        }}
        className={`${isSidebarExpanded ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 font-bold text-xl border-b border-slate-800">
          {isSidebarExpanded ? 'InsureWise Pro' : 'IP'}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon="📊" label="Overview" to="/dashboard" open={isSidebarExpanded} />
          <SidebarItem icon="🛡️" label="My Policies" to="/dashboard/policies" open={isSidebarExpanded} />
          <SidebarItem icon="📄" label="Quotes" to="/dashboard/quotes" open={isSidebarExpanded} />
          <SidebarItem icon="⚙️" label="Settings" to="/dashboard/settings" open={isSidebarExpanded} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            className="w-full text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-colors rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {isSidebarOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="font-bold text-gray-700">Client Portal</h2>
          <button
            type="button"
            onClick={() => navigate('/dashboard/quotes')}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get New Quote
          </button>
        </header>
        <div className="p-8 flex-1">
          <Outlet />
        </div>

        <Footer />
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, to, open }) {
  return (
    <Link to={to} className="flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors">
      <span className="text-xl">{icon}</span>
      {open && <span className="ml-4">{label}</span>}
    </Link>
  )
}
