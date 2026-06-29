'use client'

import { useEffect, useState } from 'react'
import type { Booking, BookingStatus } from '@/types'

function formatPeso(n: number) { return '₱' + n.toLocaleString('en-PH') }

const STATUS_COLORS: Record<string, string> = {
  Pending:   'badge-pending',
  Confirmed: 'badge-confirmed',
  Declined:  'badge-declined',
  Cancelled: 'badge-cancelled',
}

const PAY_COLORS: Record<string, string> = {
  'Unpaid':                'bg-red-100 text-red-700',
  'Downpayment Received':  'bg-yellow-100 text-yellow-700',
  'Fully Paid':            'bg-green-100 text-green-700',
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<BookingStatus | 'All'>('All')
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState<Booking | null>(null)
  const [updating, setUpdating] = useState(false)
  const [toast,    setToast]    = useState('')

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    setLoading(true)
    try {
      const res  = await fetch('/api/bookings')
      const data = await res.json()
      if (data.success) setBookings(data.data)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, bookingStatus: BookingStatus) {
    setUpdating(true)
    try {
      const res  = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === id ? data.data : b))
        if (selected?.id === id) setSelected(data.data)
        showToast(`Booking ${bookingStatus.toLowerCase()} successfully!`)
      }
    } finally {
      setUpdating(false)
    }
  }

  async function updatePayment(id: string, paymentStatus: string) {
    setUpdating(true)
    try {
      const res  = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === id ? data.data : b))
        if (selected?.id === id) setSelected(data.data)
        showToast('Payment status updated!')
      }
    } finally {
      setUpdating(false)
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'All' || b.bookingStatus === filter
    const matchSearch = !search || b.guestName.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search)
    return matchStatus && matchSearch
  })

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-forest text-cream px-4 py-2 rounded-xl text-sm shadow-lg">
          ✓ {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-forest">Bookings</h1>
        <a href="/booking" target="_blank"
          className="text-xs bg-clay text-cream px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
          + New booking page ↗
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or booking ID..."
          className="input flex-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {(['All', 'Pending', 'Confirmed', 'Declined', 'Cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === s ? 'bg-forest text-cream' : 'bg-cream-dark text-stone hover:bg-stone/20'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone/50">
          <div className="text-4xl mb-3">📋</div>
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div
              key={b.id}
              onClick={() => setSelected(b)}
              className="card hover:border-forest/30 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-stone-dark">{b.guestName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[b.bookingStatus]}`}>
                      {b.bookingStatus}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PAY_COLORS[b.paymentStatus]}`}>
                      {b.paymentStatus}
                    </span>
                  </div>
                  <div className="text-sm text-stone">{b.house} · {b.checkIn} → {b.checkOut} · {b.nights} nights · {b.guests} guests</div>
                  <div className="text-xs text-stone/60 mt-1">{b.id} · {b.phone}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-medium text-forest">{formatPeso(b.totalAmount)}</div>
                  <div className="text-xs text-stone/60">{b.paymentMethod}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-forest text-lg">Booking details</h2>
                <button onClick={() => setSelected(null)} className="text-stone hover:text-forest text-xl">×</button>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {[
                  ['ID',            selected.id],
                  ['Guest',         selected.guestName],
                  ['Email',         selected.email],
                  ['Phone',         selected.phone],
                  ['House',         selected.house],
                  ['Check-in',      selected.checkIn],
                  ['Check-out',     selected.checkOut],
                  ['Nights',        selected.nights],
                  ['Guests',        selected.guests],
                  ['Total',         formatPeso(selected.totalAmount)],
                  ['Downpayment',   formatPeso(selected.downpayment)],
                  ['Balance',       formatPeso(selected.balance)],
                  ['Payment via',   selected.paymentMethod],
                  ['Special notes', selected.specialRequests || '—'],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex gap-3">
                    <span className="text-stone w-28 flex-shrink-0">{k}</span>
                    <span className="text-stone-dark font-medium">{v}</span>
                  </div>
                ))}
              </div>

              {/* Status badges */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[selected.bookingStatus]}`}>
                  {selected.bookingStatus}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${PAY_COLORS[selected.paymentStatus]}`}>
                  {selected.paymentStatus}
                </span>
              </div>

              {/* Actions */}
              <div className="border-t border-stone/20 pt-4 space-y-3">
                {selected.bookingStatus === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(selected.id, 'Confirmed')}
                      disabled={updating}
                      className="btn-primary flex-1 text-sm py-2 disabled:opacity-40"
                    >
                      ✓ Confirm booking
                    </button>
                    <button
                      onClick={() => updateStatus(selected.id, 'Declined')}
                      disabled={updating}
                      className="flex-1 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm py-2 hover:bg-red-100 transition-colors disabled:opacity-40"
                    >
                      ✕ Decline
                    </button>
                  </div>
                )}

                {selected.bookingStatus === 'Confirmed' && (
                  <div>
                    <div className="text-xs text-stone mb-2 font-medium">Update payment status:</div>
                    <div className="flex gap-2 flex-wrap">
                      {['Unpaid', 'Downpayment Received', 'Fully Paid'].map(ps => (
                        <button
                          key={ps}
                          onClick={() => updatePayment(selected.id, ps)}
                          disabled={updating || selected.paymentStatus === ps}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all disabled:opacity-40 ${
                            selected.paymentStatus === ps
                              ? 'bg-forest text-cream border-forest'
                              : 'border-stone/30 hover:border-forest text-stone'
                          }`}
                        >
                          {ps}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selected.bookingStatus === 'Confirmed' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'Cancelled')}
                    disabled={updating}
                    className="w-full text-sm text-stone/60 hover:text-red-600 transition-colors py-2 disabled:opacity-40"
                  >
                    Cancel this booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
