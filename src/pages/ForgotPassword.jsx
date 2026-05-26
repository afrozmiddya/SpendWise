import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return }
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <AuthLayout title="Email sent!" subtitle="Check your inbox for the reset link">
      <div className="text-center py-4">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle2 size={56} className="text-brand-500 mx-auto mb-4" />
        </motion.div>
        <p className="text-secondary text-sm mb-6">
          We sent a password reset link to <strong className="text-primary">{email}</strong>.
          Check your spam folder if you don't see it.
        </p>
        <Link to="/login" className="btn-primary justify-center w-full">Back to Sign In</Link>
      </div>
    </AuthLayout>
  )

  return (
    <AuthLayout title="Reset password" subtitle="We'll send you a reset link">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input ref={inputRef} id="email" type="email" placeholder="you@example.com"
              value={email} onChange={e => { setEmail(e.target.value); setError('') }}
              className={`input pl-9 ${error ? 'border-red-500/60' : ''}`} />
          </div>
          {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
        </div>

        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
          className="btn-primary w-full justify-center py-3.5">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send Reset Link <ArrowRight size={16} /></>}
        </motion.button>
      </form>

      <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-secondary hover:text-primary transition-colors mt-6">
        <ArrowLeft size={14} /> Back to Sign In
      </Link>
    </AuthLayout>
  )
}
