import React, { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CreditCard, BarChart3, User, Settings,
  LogOut, Sun, Moon, Menu, X, ChevronDown, Wallet
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/expenses', icon: CreditCard, label: 'Expenses' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout() {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
      toast.success('Signed out successfully')
    } catch (e) {
      toast.error('Sign out failed')
    }
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const avatarUrl = profile?.avatar_url
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const pageTitle = NAV_ITEMS.find(n => location.pathname.startsWith(n.to))?.label || 'SpendWise'

  return (
    <div className="h-[100dvh] bg-primary flex overflow-hidden relative">
      {/* Ambient blobs */}
      <div className="ambient-blob w-96 h-96 bg-brand-500 top-0 left-0" />
      <div className="ambient-blob w-64 h-64 bg-blue-500 bottom-0 right-0" />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 h-full w-64 z-30 flex flex-col flex-shrink-0
          glass-strong border-r border-[var(--border)]
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
            {/* Logo */}
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-glow">
                  <Wallet size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-lg text-primary leading-none">SpendWise</h1>
                  <p className="text-xs text-muted mt-0.5">Smart Finance</p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User mini-profile at bottom */}
            <div className="p-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold overflow-hidden flex-shrink-0">
                  {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{displayName}</p>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
                </div>
              </div>
            </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 w-full overflow-hidden">
        {/* Top navbar */}
        <header className="flex-shrink-0 z-10 glass border-b border-[var(--border)] px-4 lg:px-6 py-3 flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden btn-ghost p-2"
          >
            <Menu size={20} />
          </button>

          {/* Page title */}
          <h2 className="text-base font-semibold text-primary flex-1">{pageTitle}</h2>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-primary transition-colors"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass hover:border-brand-500/30 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold overflow-hidden">
                  {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" /> : initials}
                </div>
                <span className="text-sm font-medium text-primary hidden sm:block max-w-24 truncate">{displayName}</span>
                <ChevronDown size={14} className={`text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-52 glass-strong rounded-2xl shadow-glass border border-[var(--border)] overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-[var(--border)]">
                      <p className="text-sm font-semibold text-primary truncate">{displayName}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { navigate('/app/profile'); setDropdownOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-secondary hover:text-primary hover:bg-white/5 text-sm transition-colors"
                      >
                        <User size={15} />
                        View Profile
                      </button>
                      <button
                        onClick={() => { toggleTheme(); setDropdownOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-secondary hover:text-primary hover:bg-white/5 text-sm transition-colors"
                      >
                        {isDark ? <Sun size={15} /> : <Moon size={15} />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <div className="border-t border-[var(--border)] my-1" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 min-h-0 p-4 sm:p-5 lg:p-6 overflow-y-auto overflow-x-hidden">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
