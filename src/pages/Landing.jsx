import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Wallet, BarChart3, Shield, Zap, TrendingDown, CheckCircle2 } from 'lucide-react'

const FEATURES = [
  { icon: Wallet, title: 'Track Every Rupee', desc: 'Log expenses in seconds with smart categorization across 6 categories.' },
  { icon: BarChart3, title: 'Visual Analytics', desc: 'Pie charts, trend lines, and monthly breakdowns to understand your money.' },
  { icon: Shield, title: 'Bank-Grade Security', desc: 'Row-level security via Supabase. Your data is yours, always.' },
  { icon: Zap, title: 'Blazing Fast', desc: 'Real-time sync across devices. No lag, no delays.' },
]

const STATS = [
  { value: '₹2.4L', label: 'Avg. savings tracked/year' },
  { value: '6', label: 'Smart categories' },
  { value: '100%', label: 'Private & secure' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-primary overflow-hidden">
      {/* Ambient */}
      <div className="ambient-blob w-[600px] h-[600px] bg-brand-500 -top-64 -left-32" style={{ opacity: 0.07 }} />
      <div className="ambient-blob w-96 h-96 bg-blue-600 bottom-0 right-0" style={{ opacity: 0.05 }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-glow">
            <Wallet size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-primary">SpendWise</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/signup" className="btn-primary text-sm py-2 px-5">Get Started <ArrowRight size={15} /></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-brand-500/30 text-brand-400 text-xs font-semibold mb-6">
            <TrendingDown size={13} /> Smart Expense Intelligence
          </span>
          <h1 className="text-4xl lg:text-7xl font-bold text-primary leading-tight tracking-tight mb-6">
            Control your money.<br />
            <span className="gradient-text">Not the other way.</span>
          </h1>
          <p className="text-secondary text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            SpendWise helps you track expenses, visualize spending patterns, and make smarter financial decisions — beautifully.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary text-base px-8 py-3.5">
              Start Tracking Free <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
              I have an account
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-8 lg:gap-16 mt-16"
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold gradient-text">{value}</div>
              <div className="text-sm text-muted mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Dashboard preview card */}
      <motion.section
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 px-6 lg:px-16 mb-20"
      >
        <div className="max-w-4xl mx-auto glass rounded-3xl p-6 shadow-glass border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {['Total Spent', 'This Month', 'Today'].map((label, i) => (
              <div key={label} className="glass rounded-xl p-4 border border-[var(--border)]">
                <p className="text-xs text-muted mb-1">{label}</p>
                <p className="text-xl font-bold gradient-text">{['₹48,290', '₹12,400', '₹890'][i]}</p>
              </div>
            ))}
          </div>
          <div className="glass rounded-xl p-4 border border-[var(--border)]">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold text-primary">Recent Transactions</p>
              <span className="text-xs text-brand-400">View all →</span>
            </div>
            {[
              { title: 'Zomato Order', cat: '🍽️ Food', amt: '-₹420', color: 'text-red-400' },
              { title: 'Uber Ride', cat: '🚗 Transport', amt: '-₹180', color: 'text-red-400' },
              { title: 'Amazon Shopping', cat: '🛍️ Shopping', amt: '-₹2,499', color: 'text-red-400' },
            ].map(({ title, cat, amt, color }) => (
              <div key={title} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="text-sm font-medium text-primary">{title}</p>
                  <p className="text-xs text-muted">{cat}</p>
                </div>
                <span className={`text-sm font-semibold font-mono ${color}`}>{amt}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section className="relative z-10 px-6 lg:px-16 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">Everything you need</h2>
            <p className="text-secondary max-w-xl mx-auto">A complete financial companion built for modern India.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="card group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4 group-hover:bg-brand-500/25 transition-colors">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-primary mb-2">{title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-16 py-20 text-center">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-10 border border-brand-500/20 shadow-glow-lg">
          <CheckCircle2 size={40} className="text-brand-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-primary mb-3">Ready to take control?</h2>
          <p className="text-secondary mb-8">Join and start tracking your expenses smarter today.</p>
          <Link to="/signup" className="btn-primary mx-auto w-fit px-8 py-3.5 text-base">
            Create Free Account <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-[var(--border)]">
        <p className="text-sm text-muted">© {new Date().getFullYear()} SpendWise. Built with ❤️ for smart spenders.</p>
      </footer>
    </div>
  )
}
