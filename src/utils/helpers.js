import { format, formatDistanceToNow, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export const formatCurrency = (amount, currency = '₹') =>
  `${currency}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), 'dd MMM yyyy') } catch { return dateStr }
}

export const formatRelativeDate = (dateStr) => {
  if (!dateStr) return '—'
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }) } catch { return dateStr }
}

export const getMonthRange = (monthsBack = 0) => ({
  start: format(startOfMonth(subMonths(new Date(), monthsBack)), 'yyyy-MM-dd'),
  end: format(endOfMonth(subMonths(new Date(), monthsBack)), 'yyyy-MM-dd'),
})

export const getMonthlyData = (expenses) => {
  const months = {}
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i)
    const key = format(d, 'yyyy-MM')
    months[key] = { month: format(d, 'MMM yy'), total: 0 }
  }
  expenses.forEach(e => {
    const key = e.date?.substring(0, 7)
    if (key && months[key]) months[key].total += Number(e.amount)
  })
  return Object.values(months)
}

export const exportToCSV = (expenses) => {
  const headers = ['Title', 'Amount', 'Category', 'Date', 'Notes']
  const rows = expenses.map(e => [
    e.title, e.amount, e.category, e.date, e.notes || ''
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `spendwise-expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const colors = ['', '#ef4444', '#f59e0b', '#eab308', '#25a567', '#10b981']
  return { score, label: labels[score] || '', color: colors[score] || '' }
}

export const classNames = (...classes) => classes.filter(Boolean).join(' ')
