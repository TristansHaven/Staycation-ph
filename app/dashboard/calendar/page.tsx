'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO } from 'date-fns'
import type { Booking } from '@/types'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookings,     setBookings]     = useState<Booking[]>([])
  const [loading,      setLoading]      = useState(true)
  const [selected,     setSelected]     = useState<Date | null>(null)

  useEffect(() => {
    fetch('/api/bookings')
      .then(r => r.json())
      .then(d => { if (d.success) setBookings(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const days    = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const startDay = getDay(startOfMonth(currentMonth))

  function getBookingsForDay(date: Date): Booking[] {
    return bookings.filter(b => {
      if (b.bookingStatus === 'Cancelled' || b.bookingStatus === 'Declined') return false
      const cin  = parseISO(b.checkIn)
      const cout = parseISO(b.checkOut)
      return date >= cin && date < cout
    })
  }

  const selectedBookings = selected ? getBookingsForDay(selected) : []

  const COLORS: Record<string, string> = {
    Confirmed: 'bg-forest',
    Pending:   'bg-clay',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-forest">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="btn-secondary px-3 py-1.5 text-sm">←</button>
          <span className="font-medium text-stone-dark min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="btn-secondary px-3 py-1.5 text-sm">→</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-forest"></div>Confirmed</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-clay"></div>Pending</div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone">Loading calendar...</div>
      ) : (
        <div className="card">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-stone py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const dayBookings = getBookingsForDay(day)
              const isSelected  = selected && isSameDay(day, selected)
              const isToday     = isSameDay(day, new Date())
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelected(isSameDay(day, selected!) ? null : day)}
                  className={`min-h-[60px] p-1 rounded-xl cursor-pointer transition-all border ${
                    isSelected ? 'border-forest bg-forest/5' :
                    isToday    ? 'border-clay/50 bg-clay/5' :
                                 'border-transparent hover:border-stone/20'
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-clay text-cream' : 'text-stone-dark'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 2).map(b => (
                      <div key={b.id}
                        className={`text-xs text-white px-1 py-0.5 rounded truncate ${COLORS[b.bookingStatus] || 'bg-stone'}`}>
                        {b.guestName.split(' ')[0]}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-xs text-stone/60">+{dayBookings.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected day detail */}
      {selected && (
        <div className="card mt-4">
          <h3 className="font-display text-forest mb-3">{format(selected, 'MMMM d, yyyy')}</h3>
          {selectedBookings.length === 0 ? (
            <p className="text-stone/60 text-sm">No bookings on this date.</p>
          ) : (
            <div className="space-y-2">
              {selectedBookings.map(b => (
                <div key={b.id} className="flex items-start justify-between p-3 bg-cream rounded-xl text-sm">
                  <div>
                    <div className="font-medium text-stone-dark">{b.guestName}</div>
                    <div className="text-stone text-xs">{b.house} · {b.checkIn} → {b.checkOut}</div>
                    <div className="text-stone/60 text-xs">{b.guests} guests · {b.phone}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    b.bookingStatus === 'Confirmed' ? 'badge-confirmed' : 'badge-pending'
                  }`}>{b.bookingStatus}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
