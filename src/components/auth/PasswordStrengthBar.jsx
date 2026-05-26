import React from 'react'
import { getPasswordStrength } from '../../utils/helpers'

export default function PasswordStrengthBar({ password }) {
  const { score, label, color } = getPasswordStrength(password)
  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? color : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
      {label && (
        <p className="text-xs font-medium" style={{ color }}>{label}</p>
      )}
    </div>
  )
}
