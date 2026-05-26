import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ open, onClose, children, maxWidth = 'max-w-md', ariaLabel }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
            aria-hidden="true"
          />

          <div
            className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-3 sm:p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className={`pointer-events-auto w-full ${maxWidth} max-h-[min(92dvh,calc(100dvh-1.5rem))] flex flex-col
                         glass-strong rounded-2xl sm:rounded-3xl shadow-glass border border-[var(--border)]
                         overflow-hidden`}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
