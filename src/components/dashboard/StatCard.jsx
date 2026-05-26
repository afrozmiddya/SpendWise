import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ icon: Icon, label, value, sub, trend, trendUp, color = '#25a567', delay = 0, loading }) {
  if (loading) return (
    <div className="card">
      <div className="skeleton h-8 w-8 rounded-xl mb-4" />
      <div className="skeleton h-3 w-20 rounded mb-3" />
      <div className="skeleton h-7 w-28 rounded" />
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? 'bg-brand-500/15 text-brand-400' : 'bg-red-500/15 text-red-400'}`}>
            {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}%
          </span>
        )}
      </div>
      <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg sm:text-2xl font-bold text-primary font-mono truncate">{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </motion.div>
  )
}
