import { supabase } from '../supabase/client'

export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍽️', color: '#f59e0b' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#3b82f6' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { id: 'bills', label: 'Bills & Utilities', icon: '⚡', color: '#8b5cf6' },
  { id: 'health', label: 'Health & Medical', icon: '🏥', color: '#ef4444' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#06b6d4' },
  { id: 'education', label: 'Education', icon: '📚', color: '#10b981' },
  { id: 'investment', label: 'Investment', icon: '📈', color: '#25a567' },
  { id: 'travel', label: 'Travel', icon: '✈️', color: '#f97316' },
  { id: 'other', label: 'Other', icon: '📦', color: '#94a3b8' },
]

export const getCategoryById = (id) =>
  CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]

export const expenseService = {
  async getAll(userId, { startDate, endDate, category, search, sortBy = 'date', sortDir = 'desc' } = {}) {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order(sortBy === 'amount' ? 'amount' : 'date', { ascending: sortDir === 'asc' })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    if (category && category !== 'all') query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async create(userId, expense) {
    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) throw error
  },

  async getStats(userId) {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount, category, date')
      .eq('user_id', userId)
    if (error) throw error
    return data || []
  },

  async getBudgets(userId) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data || []
  },

  async upsertBudget(userId, category, amount) {
    const { data, error } = await supabase
      .from('budgets')
      .upsert({ user_id: userId, category, amount, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    return data
  },
}
