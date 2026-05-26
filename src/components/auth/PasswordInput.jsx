import React, { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const PasswordInput = forwardRef(({ label, id, placeholder, value, onChange, error, hint, ...props }, ref) => {
  const [show, setShow] = useState(false)

  return (
    <div>
      {label && <label htmlFor={id} className="label">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder || '••••••••'}
          value={value}
          onChange={onChange}
          className={`input pr-10 ${error ? 'border-red-500/60 focus:border-red-500' : ''}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
      {hint && !error && <p className="text-xs text-muted mt-1.5">{hint}</p>}
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'
export default PasswordInput
