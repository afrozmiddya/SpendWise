import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="ambient-blob w-96 h-96 bg-brand-500 -top-24 -left-24" style={{ opacity: 0.1 }} />
      <div className="ambient-blob w-64 h-64 bg-blue-500 bottom-0 right-0" style={{ opacity: 0.07 }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-glow">
            <Wallet size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-primary">SpendWise</span>
        </Link>

        <div className="glass-strong rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-glass">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
            <p className="text-secondary text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
