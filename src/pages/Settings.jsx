import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save, Sun, Moon, Trash2, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useExpenses } from '../hooks/useExpenses'
import { exportToCSV } from '../utils/helpers'
import { supabase } from '../supabase/client'
import toast from 'react-hot-toast'

const CURRENCIES = [
  { code: '₹', label: 'INR — Indian Rupee (₹)' },
  { code: '$', label: 'USD — US Dollar ($)' },
  { code: '€', label: 'EUR — Euro (€)' },
  { code: '£', label: 'GBP — British Pound (£)' },
  { code: '¥', label: 'JPY — Japanese Yen (¥)' },
  { code: 'A$', label: 'AUD — Australian Dollar (A$)' },
]

export default function Settings() {
  const { profile, updateProfile, user } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const { expenses } = useExpenses()
  const [currency, setCurrency] = useState(profile?.currency || '₹')
  const [saving, setSaving] = useState(false)
  const [deletePhrase, setDeletePhrase] = useState('')
  const [deletingAll, setDeletingAll] = useState(false)
  const [showDeleteZone, setShowDeleteZone] = useState(false)

  useEffect(() => {
    if (profile?.currency) setCurrency(profile.currency)
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({ currency })
      toast.success('Settings saved!')
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAll = async () => {
    if (deletePhrase !== 'DELETE') { toast.error('Type DELETE to confirm'); return }
    setDeletingAll(true)
    try {
      const { error } = await supabase.from('expenses').delete().eq('user_id', user.id)
      if (error) throw error
      toast.success('All expenses deleted')
      setDeletePhrase('')
      setShowDeleteZone(false)
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    } finally {
      setDeletingAll(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-secondary text-sm mt-1">Customize your SpendWise experience</p>
      </div>

      {/* Appearance */}
      <div className="card">
        <h3 className="font-semibold text-primary mb-5">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Theme</p>
            <p className="text-xs text-secondary mt-0.5">Currently: {isDark ? 'Dark mode' : 'Light mode'}</p>
          </div>
          <button onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isDark ? 'bg-brand-500' : 'bg-surface-200'}`}>
            <motion.div
              animate={{ x: isDark ? 28 : 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              {isDark ? <Moon size={10} className="text-brand-600" /> : <Sun size={10} className="text-yellow-500" />}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Currency */}
      <div className="card">
        <h3 className="font-semibold text-primary mb-5">Currency</h3>
        <div className="space-y-3">
          <div>
            <label className="label">Display Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="input appearance-none cursor-pointer">
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <p className="text-xs text-muted mt-1.5">This affects how amounts are displayed across the app.</p>
          </div>
          <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale: 0.98 }}
            className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Preferences</>}
          </motion.button>
        </div>
      </div>

      {/* Export */}
      <div className="card">
        <h3 className="font-semibold text-primary mb-2">Export Data</h3>
        <p className="text-sm text-secondary mb-4">Download your expense history as a CSV file for external use.</p>
        <button onClick={() => exportToCSV(expenses)}
          className="btn-secondary">
          <Download size={15} /> Export All Expenses as CSV
        </button>
      </div>

      {/* Danger zone */}
      <div className="card border border-red-500/20">
        <h3 className="font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-secondary mb-4">Permanently delete all your expense data. This cannot be undone.</p>

        {!showDeleteZone ? (
          <button onClick={() => setShowDeleteZone(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-colors">
            <Trash2 size={15} /> Delete All Expenses
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
            <p className="text-sm text-red-400">Type <strong>DELETE</strong> below to confirm:</p>
            <input
              type="text"
              value={deletePhrase}
              onChange={e => setDeletePhrase(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="input border-red-500/40 focus:border-red-500"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteZone(false); setDeletePhrase('') }}
                className="btn-secondary text-sm py-2 px-4">Cancel</button>
              <button onClick={handleDeleteAll} disabled={deletingAll || deletePhrase !== 'DELETE'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {deletingAll ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Confirm Delete
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
