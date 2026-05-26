import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import PasswordInput from '../components/auth/PasswordInput'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/app/dashboard'
  const emailRef = useRef(null)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) navigate(from, { replace: true }) }, [user])
  useEffect(() => { emailRef.current?.focus() }, [])

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await signIn(form)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.message || 'Sign in failed'
      if (msg.toLowerCase().includes('invalid')) {
        setErrors({ password: 'Invalid email or password' })
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })) }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your SpendWise account">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              className={`input pl-9 ${errors.email ? 'border-red-500/60' : ''}`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Forgot password?
          </Link>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full justify-center py-3.5"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
        </motion.button>
      </form>

      <p className="text-center text-sm text-secondary mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
