import { useState, useEffect, useCallback, useMemo } from 'react'
import { expenseService } from '../services/expenseService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export function useExpenses(filters = {}) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExpenses = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const data = await expenseService.getAll(user.id, filters)
      setExpenses(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [user, JSON.stringify(filters)])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const addExpense = useCallback(async (expense) => {
    if (!user) return
    try {
      const newExp = await expenseService.create(user.id, expense)
      setExpenses(prev => [newExp, ...prev])
      toast.success('Expense added!')
      return newExp
    } catch (e) {
      toast.error(e.message || 'Failed to add expense')
      throw e
    }
  }, [user])

  const editExpense = useCallback(async (id, updates) => {
    try {
      const updated = await expenseService.update(id, updates)
      setExpenses(prev => prev.map(e => e.id === id ? updated : e))
      toast.success('Expense updated!')
      return updated
    } catch (e) {
      toast.error(e.message || 'Failed to update expense')
      throw e
    }
  }, [])

  const removeExpense = useCallback(async (id) => {
    try {
      await expenseService.delete(id)
      setExpenses(prev => prev.filter(e => e.id !== id))
      toast.success('Expense deleted')
    } catch (e) {
      toast.error(e.message || 'Failed to delete expense')
      throw e
    }
  }, [])

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().substring(0, 7)
    const todayTotal = expenses.filter(e => e.date?.startsWith(today)).reduce((s, e) => s + Number(e.amount), 0)
    const monthTotal = expenses.filter(e => e.date?.startsWith(thisMonth)).reduce((s, e) => s + Number(e.amount), 0)
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
      return acc
    }, {})
    return { total, todayTotal, monthTotal, byCategory, count: expenses.length }
  }, [expenses])

  return { expenses, loading, error, stats, addExpense, editExpense, removeExpense, refresh: fetchExpenses }
}
