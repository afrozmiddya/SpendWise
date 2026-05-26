import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, CreditCard, Calendar, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useExpenses } from '../hooks/useExpenses'
import { CATEGORIES, getCategoryById } from '../services/expenseService'
import { formatCurrency, formatDate, getMonthlyData } from '../utils/helpers'
import StatCard from '../components/dashboard/StatCard'
import { format, startOfMonth, endOfMonth } from 'date-fns'

const CATEGORY_COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4']

const CustomTooltip = ({ active, payload, currency }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs border border-[var(--border)] shadow-glass">
      <p className="font-semibold text-primary">{payload[0].name}</p>
      <p className="text-brand-400 font-mono">{formatCurrency(payload[0].value, currency)}</p>
    </div>
  )
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const currency = profile?.currency || '₹'
  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  const { expenses, loading, stats, addExpense } = useExpenses()

  const monthlyData = useMemo(() => getMonthlyData(expenses), [expenses])

  const pieData = useMemo(() =>
    Object.entries(stats.byCategory)
      .map(([id, value]) => ({ name: getCategoryById(id).label, value, color: getCategoryById(id).color }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    [stats.byCategory]
  )

  const recentExpenses = useMemo(() =>
    [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [expenses]
  )

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div className="space-y-6 page-enter">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Good {getGreeting()}, {displayName} 👋</h1>
          <p className="text-secondary text-sm mt-1">{format(now, 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <Link to="/app/expenses" className="btn-primary self-start sm:self-auto">
          <Plus size={16} /> Add Expense
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CreditCard} label="Total Spent" value={formatCurrency(stats.total, currency)}
          color="#25a567" delay={0} loading={loading} />
        <StatCard icon={Calendar} label="This Month" value={formatCurrency(stats.monthTotal, currency)}
          color="#3b82f6" delay={0.05} loading={loading} />
        <StatCard icon={BarChart3} label="Today" value={formatCurrency(stats.todayTotal, currency)}
          color="#f59e0b" delay={0.1} loading={loading} />
        <StatCard icon={TrendingUp} label="Transactions" value={stats.count}
          sub="all time" color="#8b5cf6" delay={0.15} loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly bar chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-primary">Monthly Spending</h3>
              <p className="text-xs text-muted mt-0.5">Last 6 months</p>
            </div>
          </div>
          {loading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${currency}${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(37,165,103,0.08)' }} />
                <Bar dataKey="total" fill="#25a567" radius={[6, 6, 0, 0]} maxBarSize={40}
                  name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="mb-6">
            <h3 className="font-semibold text-primary">By Category</h3>
            <p className="text-xs text-muted mt-0.5">All time</p>
          </div>
          {loading ? (
            <div className="skeleton h-40 rounded-xl" />
          ) : pieData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    paddingAngle={3} stroke="none">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {pieData.slice(0, 4).map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-xs text-secondary truncate max-w-24">{name}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-primary">{formatCurrency(value, currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-primary">Recent Transactions</h3>
            <p className="text-xs text-muted mt-0.5">Latest 5 expenses</p>
          </div>
          <Link to="/app/expenses" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted text-sm">No expenses yet.</p>
            <Link to="/app/expenses" className="btn-primary mt-4 mx-auto w-fit text-sm">
              <Plus size={15} /> Add your first expense
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {recentExpenses.map((exp, i) => {
              const cat = getCategoryById(exp.category)
              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${cat.color}20` }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{exp.title}</p>
                    <p className="text-xs text-muted">{cat.label} · {formatDate(exp.date)}</p>
                  </div>
                  <span className="text-sm font-semibold font-mono text-red-400 flex-shrink-0">
                    -{formatCurrency(exp.amount, currency)}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
