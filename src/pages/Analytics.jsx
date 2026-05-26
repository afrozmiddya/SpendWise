import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from 'recharts'
import { useExpenses } from '../hooks/useExpenses'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, getCategoryById } from '../services/expenseService'
import { formatCurrency, getMonthlyData } from '../utils/helpers'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs border border-[var(--border)] shadow-glass">
      {label && <p className="text-muted mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color || '#25a567' }}>
          {p.name}: {typeof p.value === 'number' ? formatCurrency(p.value, currency) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { profile } = useAuth()
  const currency = profile?.currency || '₹'
  const { expenses, loading, stats } = useExpenses()
  const [activeMonth, setActiveMonth] = useState(0)

  const monthlyData = useMemo(() => getMonthlyData(expenses), [expenses])

  const categoryData = useMemo(() =>
    Object.entries(stats.byCategory)
      .map(([id, value]) => {
        const cat = getCategoryById(id)
        return { name: cat.label, value, color: cat.color, icon: cat.icon, pct: stats.total > 0 ? ((value / stats.total) * 100).toFixed(1) : 0 }
      })
      .sort((a, b) => b.value - a.value),
    [stats]
  )

  const dailyData = useMemo(() => {
    const days = {}
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = format(d, 'yyyy-MM-dd')
      days[key] = { day: format(d, 'dd MMM'), total: 0 }
    }
    expenses.forEach(e => {
      if (days[e.date]) days[e.date].total += Number(e.amount)
    })
    return Object.values(days)
  }, [expenses])

  if (loading) return (
    <div className="space-y-5 page-enter">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-5 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-primary">Analytics</h1>
        <p className="text-secondary text-sm mt-1">Visualize and understand your spending patterns</p>
      </div>

      {expenses.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-primary font-semibold mb-2">No data to analyze yet</p>
          <p className="text-muted text-sm">Add some expenses to see your analytics</p>
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Tracked', value: formatCurrency(stats.total, currency), sub: `${stats.count} transactions` },
              { label: 'Monthly Avg', value: formatCurrency(monthlyData.reduce((s, m) => s + m.total, 0) / (monthlyData.filter(m => m.total > 0).length || 1), currency), sub: 'last 6 months' },
              { label: 'Highest Category', value: categoryData[0]?.icon + ' ' + (categoryData[0]?.name || '—'), sub: formatCurrency(categoryData[0]?.value || 0, currency) },
              { label: 'This Month', value: formatCurrency(stats.monthTotal, currency), sub: 'current month' },
            ].map(({ label, value, sub }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="card">
                <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">{label}</p>
                <p className="text-lg font-bold text-primary">{value}</p>
                <p className="text-xs text-muted mt-0.5">{sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Monthly bar + Category pie */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 card">
              <h3 className="font-semibold text-primary mb-1">Monthly Spending</h3>
              <p className="text-xs text-muted mb-5">Last 6 months comparison</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${currency}${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(37,165,103,0.08)' }} />
                  <Bar dataKey="total" name="Spent" fill="#25a567" radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-2 card">
              <h3 className="font-semibold text-primary mb-1">Category Split</h3>
              <p className="text-xs text-muted mb-4">All time distribution</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={3} stroke="none">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categoryData.slice(0, 4).map(({ name, value, color, pct, icon }) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs text-secondary flex-1 truncate">{icon} {name}</span>
                    <span className="text-xs font-mono text-primary">{formatCurrency(value, currency)}</span>
                    <span className="text-xs text-muted w-10 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily trend */}
          <div className="card">
            <h3 className="font-semibold text-primary mb-1">Daily Spending (Last 30 Days)</h3>
            <p className="text-xs text-muted mb-5">Day-by-day trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25a567" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#25a567" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
                  interval={4} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${currency}${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Area type="monotone" dataKey="total" name="Spent" stroke="#25a567" strokeWidth={2}
                  fill="url(#grad)" dot={false} activeDot={{ r: 5, fill: '#25a567' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category table */}
          <div className="card">
            <h3 className="font-semibold text-primary mb-5">Category Breakdown</h3>
            <div className="space-y-3">
              {categoryData.map(({ name, value, color, pct, icon }) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-secondary">{icon} {name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted">{pct}%</span>
                      <span className="text-sm font-semibold font-mono text-primary">{formatCurrency(value, currency)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
