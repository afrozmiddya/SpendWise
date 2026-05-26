import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, User, Phone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import PasswordInput from '../components/auth/PasswordInput'
import PasswordStrengthBar from '../components/auth/PasswordStrengthBar'
import toast from 'react-hot-toast'

export default function SignUp() {
  const { signUp, user } = useAuth()
  const navigate = useNavigate()
  const nameRef = useRef(null)

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => { if (user) navigate('/app/dashboard') }, [user])
  useEffect(() => { nameRef.current?.focus() }, [])

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    else if (form.fullName.trim().length < 2) e.fullName = 'Name too short'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone) e.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter a valid 10-digit mobile number'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await signUp({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone })
      setSuccess(true)
    } catch (err) {
      const msg = err.message || 'Sign up failed'
      if (msg.toLowerCase().includes('already registered')) {
        setErrors({ email: 'This email is already registered' })
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })) }

  if (success) return (
    <AuthLayout title="Check your inbox" subtitle="We sent you a verification email">
      <div className="text-center py-4">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle2 size={56} className="text-brand-500 mx-auto mb-4" />
        </motion.div>
        <p className="text-secondary text-sm leading-relaxed mb-6">
          A verification link has been sent to <strong className="text-primary">{form.email}</strong>.
          Click the link to activate your account.
        </p>
        <Link to="/login" className="btn-primary justify-center w-full">Go to Sign In</Link>
      </div>
    </AuthLayout>
  )

  return (
    <AuthLayout title="Create account" subtitle="Start tracking your expenses today">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="fullName" className="label">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input ref={nameRef} id="fullName" type="text" placeholder="Afroz Middya"
              value={form.fullName} onChange={set('fullName')}
              className={`input pl-9 ${errors.fullName ? 'border-red-500/60' : ''}`} />
          </div>
          {errors.fullName && <p className="text-xs text-red-400 mt-1.5">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="email" className="label">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input id="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')}
              className={`input pl-9 ${errors.email ? 'border-red-500/60' : ''}`} />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="label">Phone Number</label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input id="phone" type="tel" placeholder="9876543210"
              value={form.phone} onChange={set('phone')}
              className={`input pl-9 ${errors.phone ? 'border-red-500/60' : ''}`} />
          </div>
          {errors.phone && <p className="text-xs text-red-400 mt-1.5">{errors.phone}</p>}
        </div>

        <div>
          <PasswordInput id="password" label="Password" value={form.password}
            onChange={set('password')} error={errors.password} placeholder="Min. 8 characters" />
          <PasswordStrengthBar password={form.password} />
        </div>

        <PasswordInput id="confirmPassword" label="Confirm Password" value={form.confirmPassword}
          onChange={set('confirmPassword')} error={errors.confirmPassword} placeholder="Re-enter password" />

        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
          className="btn-primary w-full justify-center py-3.5 mt-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
        </motion.button>
      </form>

      <p className="text-center text-sm text-secondary mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
