import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, IndianRupee } from 'lucide-react'
import { CATEGORIES } from '../../services/expenseService'
import { format } from 'date-fns'

export default function ExpenseModal({ open, onClose, onSubmit, initialData, loading, currency = '₹' }) {
  const titleRef = useRef(null)
  const [form, setForm] = useState({
    title: '', amount: '', category: 'food', date: format(new Date(), 'yyyy-MM-dd'), notes: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          title: initialData.title || '',
          amount: initialData.amount || '',
          category: initialData.category || 'food',
          date: initialData.date || format(new Date(), 'yyyy-MM-dd'),
          notes: initialData.notes || '',
        })
      } else {
        setForm({ title: '', amount: '', category: 'food', date: format(new Date(), 'yyyy-MM-dd'), notes: '' })
      }
      setErrors({})
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [open, initialData])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.amount) e.amount = 'Amount is required'
    else if (isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount'
    if (!form.date) e.date = 'Date is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    await onSubmit({ ...form, amount: parseFloat(form.amount) })
  }

  const set = (k) => (v) => { setForm(f => ({ ...f, [k]: v })); setErrors(er => ({ ...er, [k]: '' })) }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                       w-auto sm:w-full sm:max-w-md glass-strong rounded-t-3xl sm:rounded-3xl p-6 z-50 shadow-glass border border-[var(--border)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-primary">{initialData ? 'Edit Expense' : 'New Expense'}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl glass flex items-center justify-center text-muted hover:text-primary transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Title */}
              <div>
                <label className="label">Title</label>
                <input ref={titleRef} type="text" placeholder="e.g. Lunch at cafe"
                  value={form.title} onChange={e => set('title')(e.target.value)}
                  className={`input ${errors.title ? 'border-red-500/60' : ''}`} />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>

              {/* Amount */}
              <div>
                <label className="label">Amount ({currency})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-mono">{currency}</span>
                  <input type="number" step="0.01" min="0" placeholder="0.00"
                    value={form.amount} onChange={e => set('amount')(e.target.value)}
                    className={`input pl-8 font-mono ${errors.amount ? 'border-red-500/60' : ''}`} />
                </div>
                {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="label">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} type="button"
                      onClick={() => set('category')(cat.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all border flex items-center gap-1.5 ${
                        form.category === cat.id
                          ? 'border-brand-500/60 bg-brand-500/15 text-brand-400'
                          : 'border-[var(--border)] glass text-secondary hover:border-brand-500/30'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="label">Date</label>
                <input type="date" value={form.date} onChange={e => set('date')(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className={`input ${errors.date ? 'border-red-500/60' : ''}`} />
                {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes <span className="text-muted normal-case font-normal">(optional)</span></label>
                <textarea placeholder="Add a note..." rows={2}
                  value={form.notes} onChange={e => set('notes')(e.target.value)}
                  className="input resize-none" />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                  className="btn-primary flex-1 justify-center">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : initialData ? 'Save Changes' : 'Add Expense'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
