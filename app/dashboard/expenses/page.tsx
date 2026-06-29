'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import type { Expense, ExpenseCategory } from '@/types'

const CATEGORIES: ExpenseCategory[] = ['Cleaning','Maintenance','Supplies','Utilities','Salaries','Marketing','Other']

function formatPeso(n: number) { return '₱' + n.toLocaleString('en-PH') }

const CAT_ICONS: Record<string, string> = {
  Cleaning: '🧹', Maintenance: '🔧', Supplies: '🛒',
  Utilities: '💡', Salaries: '👤', Marketing: '📣', Other: '📦',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState('')
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'Cleaning' as ExpenseCategory,
    description: '',
    amount: '',
    paidBy: '',
    receiptRef: '',
  })

  useEffect(() => { fetchExpenses() }, [])

  async function fetchExpenses() {
    setLoading(true)
    try {
      const res  = await fetch('/api/expenses')
      const data = await res.json()
      if (data.success) setExpenses(data.data)
    } finally { setLoading(false) }
  }

  async function addExpense() {
    if (!form.description || !form.amount || !form.paidBy) return
    setSaving(true)
    try {
      const res  = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      })
      const data = await res.json()
      if (data.success) {
        setExpenses(prev => [data.data, ...prev])
        setForm({ date: format(new Date(), 'yyyy-MM-dd'), category: 'Cleaning', description: '', amount: '', paidBy: '', receiptRef: '' })
        setShowForm(false)
        showToast('Expense added!')
      }
    } finally { setSaving(false) }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const byCategory    = CATEGORIES.map(c => ({
    cat: c,
    total: expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0)

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-forest text-cream px-4 py-2 rounded-xl text-sm shadow-lg">✓ {toast}</div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-forest">Expenses</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-4 py-2">
          + Add expense
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card col-span-2 sm:col-span-1">
          <div className="text-xs text-stone mb-1">Total expenses</div>
          <div className="text-xl font-display text-clay">{formatPeso(totalExpenses)}</div>
        </div>
        {byCategory.slice(0, 3).map(c => (
          <div key={c.cat} className="card">
            <div className="text-xs text-stone mb-1">{CAT_ICONS[c.cat]} {c.cat}</div>
            <div className="text-lg font-display text-stone-dark">{formatPeso(c.total)}</div>
          </div>
        ))}
      </div>

      {/* Add expense form */}
      {showForm && (
        <div className="card mb-6 border-2 border-forest/20">
          <h3 className="font-display text-forest mb-4">Add new expense</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone mb-1">Date</label>
              <input type="date" className="input text-sm" value={form.date}
                onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-stone mb-1">Category</label>
              <select className="input text-sm" value={form.category}
                onChange={e => setForm({...form, category: e.target.value as ExpenseCategory})}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-stone mb-1">Description *</label>
              <input type="text" className="input text-sm" placeholder="e.g. Pool chlorine restock"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-stone mb-1">Amount (₱) *</label>
              <input type="number" className="input text-sm" placeholder="0"
                value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-stone mb-1">Paid by *</label>
              <input type="text" className="input text-sm" placeholder="Allan / Petty cash"
                value={form.paidBy} onChange={e => setForm({...form, paidBy: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
            <button onClick={addExpense} disabled={saving || !form.description || !form.amount || !form.paidBy}
              className="btn-primary flex-1 text-sm py-2 disabled:opacity-40">
              {saving ? 'Saving...' : 'Save expense'}
            </button>
          </div>
        </div>
      )}

      {/* Expenses list */}
      {loading ? (
        <div className="text-center py-16 text-stone">Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16 text-stone/50">
          <div className="text-4xl mb-3">💰</div>
          <p>No expenses recorded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map(e => (
            <div key={e.id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-xl">{CAT_ICONS[e.category]}</div>
                <div>
                  <div className="font-medium text-sm text-stone-dark">{e.description}</div>
                  <div className="text-xs text-stone">{e.category} · {e.date} · Paid by {e.paidBy}</div>
                </div>
              </div>
              <div className="text-clay font-medium flex-shrink-0">{formatPeso(e.amount)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
