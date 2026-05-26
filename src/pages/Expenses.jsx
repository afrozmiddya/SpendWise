import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Trash2, Pencil, Download, SortAsc, SortDesc, ChevronDown } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, getCategoryById } from '../services/expenseService'
import { formatCurrency, formatDate, exportToCSV } from '../utils/helpers'
import ExpenseModal from '../components/expenses/ExpenseModal'
import toast from 'react-hot-toast'

export default function Expenses() {
  const { profile } = useAuth()
  const currency = profile?.currency || '₹'
  const { expenses, loading, stats, addExpense, editExpense, removeExpense } = useExpenses()

  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [sortDir, setSortDir] = useState('desc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExp, setEditingExp] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = useMemo(() => {
    let result = [...expenses]
    if (search) result = result.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.notes?.toLowerCase().includes(search.toLowerCase()))
    if (filterCat !== 'all') result = result.filter(e => e.category === filterCat)
    result.sort((a, b) => {
      const da = new Date(a.date), db = new Date(b.date)
      return sortDir === 'desc' ? db - da : da - db
    })
    return result
  }, [expenses, search, filterCat, sortDir])

  const handleSubmit = useCallback(async (data) => {
    setSubmitting(true)
    try {
      if (editingExp) {
        await editExpense(editingExp.id, data)
      } else {
        await addExpense(data)
      }
      setModalOpen(false)
      setEditingExp(null)
    } finally {
      setSubmitting(false)
    }
  }, [editingExp, editExpense, addExpense])

  const handleDelete = async (id) => {
    await removeExpense(id)
    setDeleteConfirm(null)
  }

  const openEdit = (exp) => { setEditingExp(exp); setModalOpen(true) }
  const openAdd = () => { setEditingExp(null); setModalOpen(true) }

  return (
    <div className="space-y-5 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Expenses</h1>
          <p className="text-sm text-muted mt-0.5">{filtered.length} entries · {formatCurrency(stats.total, currency)} total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(filtered)} className="btn-secondary text-sm py-2.5 px-4">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={openAdd} className="btn-primary text-sm py-2.5">
            <Plus size={15} /> Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card !p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2.5 text-sm"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="input py-2.5 pr-8 text-sm appearance-none cursor-pointer min-w-36"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>

        {/* Sort */}
        <button
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="btn-secondary py-2.5 px-4 text-sm whitespace-nowrap"
        >
          {sortDir === 'desc' ? <SortDesc size={15} /> : <SortAsc size={15} />}
          {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="card space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-primary font-semibold mb-1">{search || filterCat !== 'all' ? 'No results found' : 'No expenses yet'}</p>
          <p className="text-muted text-sm mb-6">{search || filterCat !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first expense'}</p>
          {!search && filterCat === 'all' && (
            <button onClick={openAdd} className="btn-primary mx-auto w-fit"><Plus size={15} /> Add Expense</button>
          )}
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          {/* Table header — desktop */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-[var(--border)]">
            {['Expense', 'Category', 'Date', 'Amount', ''].map(h => (
              <span key={h} className="text-xs font-semibold text-muted uppercase tracking-wider">{h}</span>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {filtered.map((exp, i) => {
              const cat = getCategoryById(exp.category)
              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group"
                >
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 border-b border-[var(--border)] hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: `${cat.color}20` }}>{cat.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-primary">{exp.title}</p>
                        {exp.notes && <p className="text-xs text-muted truncate max-w-48">{exp.notes}</p>}
                      </div>
                    </div>
                    <span className="badge text-xs" style={{ background: `${cat.color}20`, color: cat.color }}>{cat.label}</span>
                    <span className="text-sm text-secondary whitespace-nowrap">{formatDate(exp.date)}</span>
                    <span className="text-sm font-semibold font-mono text-red-400">-{formatCurrency(exp.amount, currency)}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(exp)} className="w-7 h-7 rounded-lg glass flex items-center justify-center text-muted hover:text-brand-400 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm(exp.id)} className="w-7 h-7 rounded-lg glass flex items-center justify-center text-muted hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile row */}
                  <div className="md:hidden flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cat.color}20` }}>{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{exp.title}</p>
                      <p className="text-xs text-muted">{cat.label} · {formatDate(exp.date)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold font-mono text-red-400">-{formatCurrency(exp.amount, currency)}</span>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(exp)} className="w-6 h-6 rounded-md glass flex items-center justify-center text-muted">
                          <Pencil size={11} />
                        </button>
                        <button onClick={() => setDeleteConfirm(exp.id)} className="w-6 h-6 rounded-md glass flex items-center justify-center text-muted">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <ExpenseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingExp(null) }}
        onSubmit={handleSubmit}
        initialData={editingExp}
        loading={submitting}
        currency={currency}
      />

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setDeleteConfirm(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass-strong rounded-2xl p-6 w-80 shadow-glass border border-[var(--border)]"
            >
              <h3 className="font-bold text-primary mb-2">Delete Expense?</h3>
              <p className="text-sm text-secondary mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center py-2.5 text-sm">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-semibold transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
