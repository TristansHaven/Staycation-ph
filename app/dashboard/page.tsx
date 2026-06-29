import { getDashboardStats, getAllBookings } from '@/lib/sheets'
import { format } from 'date-fns'

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className={`card border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-stone mb-1">{label}</div>
          <div className="text-2xl font-display text-stone-dark">{value}</div>
          {sub && <div className="text-xs text-stone/60 mt-1">{sub}</div>}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const [stats, bookings] = await Promise.all([
    getDashboardStats(),
    getAllBookings(),
  ])

  const pending   = bookings.filter(b => b.bookingStatus === 'Pending').slice(0, 5)
  const upcoming  = bookings
    .filter(b => b.bookingStatus === 'Confirmed' && b.checkIn >= format(new Date(), 'yyyy-MM-dd'))
    .slice(0, 5)

  function formatPeso(n: number) {
    return '₱' + n.toLocaleString('en-PH')
  }

  const statusColors: Record<string, string> = {
    Pending:   'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-green-100 text-green-800',
    Declined:  'bg-red-100 text-red-800',
    Cancelled: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-forest">Good day! 👋</h1>
        <p className="text-stone text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📋" label="Bookings this month" value={stats.bookingsThisMonth} color="border-forest" />
        <StatCard icon="💰" label="Revenue this month"  value={formatPeso(stats.revenueThisMonth)} color="border-leaf" />
        <StatCard icon="📊" label="Occupancy rate"      value={`${stats.occupancyRate}%`} sub="this month" color="border-clay" />
        <StatCard icon="⏳" label="Pending approvals"   value={stats.pendingApprovals} sub="needs review" color="border-stone" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-forest">Pending approvals</h2>
            <a href="/dashboard/bookings?status=Pending" className="text-xs text-clay hover:underline">View all →</a>
          </div>
          {pending.length === 0 ? (
            <div className="text-center py-8 text-stone/50">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm">No pending bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(b => (
                <div key={b.id} className="flex items-start justify-between p-3 bg-cream rounded-xl">
                  <div>
                    <div className="font-medium text-sm text-stone-dark">{b.guestName}</div>
                    <div className="text-xs text-stone mt-0.5">{b.house} · {b.checkIn} → {b.checkOut}</div>
                    <div className="text-xs text-stone/60">{b.guests} guests · {formatPeso(b.totalAmount)}</div>
                  </div>
                  <div className="flex flex-col gap-1.5 ml-3">
                    <a href={`/dashboard/bookings?id=${b.id}`}
                      className="text-xs bg-forest text-cream px-3 py-1 rounded-full hover:bg-forest-dark transition-colors">
                      Review
                    </a>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-center ${statusColors[b.bookingStatus]}`}>
                      {b.bookingStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming confirmed */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-forest">Upcoming stays</h2>
            <a href="/dashboard/bookings?status=Confirmed" className="text-xs text-clay hover:underline">View all →</a>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-8 text-stone/50">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm">No upcoming confirmed bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(b => (
                <div key={b.id} className="flex items-start justify-between p-3 bg-cream rounded-xl">
                  <div>
                    <div className="font-medium text-sm text-stone-dark">{b.guestName}</div>
                    <div className="text-xs text-stone mt-0.5">{b.house} · {b.checkIn} → {b.checkOut}</div>
                    <div className="text-xs text-stone/60">{b.guests} guests · {b.nights} nights</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[b.bookingStatus]}`}>
                    {b.bookingStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { href: '/booking',               icon: '🔗', label: 'Booking page' },
          { href: '/dashboard/bookings',    icon: '📋', label: 'All bookings' },
          { href: '/dashboard/calendar',    icon: '📅', label: 'Calendar' },
          { href: '/dashboard/expenses',    icon: '💰', label: 'Expenses' },
        ].map(l => (
          <a key={l.href} href={l.href}
            className="card text-center hover:border-forest/30 transition-all group">
            <div className="text-2xl mb-1">{l.icon}</div>
            <div className="text-xs text-stone group-hover:text-forest transition-colors">{l.label}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
