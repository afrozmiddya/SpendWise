import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import PasswordInput from '../components/auth/PasswordInput'
import PasswordStrengthBar from '../components/auth/PasswordStrengthBar'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await updatePassword(form.password)
      setDone(true)
      setTimeout(() => navigate('/app/dashboard'), 2000)
    } catch (err) {
      toast.error(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })) }

  if (done) return (
    <AuthLayout title="Password updated!" subtitle="You'll be redirected shortly">
      <div className="text-center py-4">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle2 size={56} className="text-brand-500 mx-auto mb-4" />
        </motion.div>
        <p className="text-secondary text-sm">Your password has been updated. Redirecting to dashboard...</p>
      </div>
    </AuthLayout>
  )

  return (
    <AuthLayout title="New password" subtitle="Choose a strong password">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <PasswordInput id="password" label="New Password" value={form.password}
            onChange={set('password')} error={errors.password} placeholder="Min. 8 characters" />
          <PasswordStrengthBar password={form.password} />
        </div>
        <PasswordInput id="confirm" label="Confirm New Password" value={form.confirm}
          onChange={set('confirm')} error={errors.confirm} />
        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
          className="btn-primary w-full justify-center py-3.5">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
        </motion.button>
      </form>
    </AuthLayout>
  )
}
