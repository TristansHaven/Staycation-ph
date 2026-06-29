'use client'

import { useState } from 'react'
import { format, differenceInDays, addDays } from 'date-fns'

// ─── Types ────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4

interface BookingForm {
  house: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  name: string
  email: string
  phone: string
  specialRequests: string
  paymentMethod: string
  totalAmount: number
  downpayment: number
  cleaningFee: number
}

const HOUSE1_RATE   = 8000
const CLEANING_FEE  = 500
const DOWNPAYMENT_PCT = 30
const MAX_GUESTS    = 15

// ─── Helpers ─────────────────────────────────────────────
function formatPeso(amount: number) {
  return '₱' + amount.toLocaleString('en-PH')
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = []
  let cur = new Date(start)
  const endDate = new Date(end)
  while (cur < endDate) {
    dates.push(format(cur, 'yyyy-MM-dd'))
    cur = addDays(cur, 1)
  }
  return dates
}

// ─── Step Indicator ───────────────────────────────────────
function StepIndicator({ step }: { step: Step }) {
  const steps = ['Dates', 'Details', 'Payment', 'Confirm']
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => {
        const num = i + 1
        const active = num === step
        const done   = num < step
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${done   ? 'bg-forest text-cream' :
                  active ? 'bg-clay text-cream' :
                           'bg-stone/20 text-stone'}`}>
                {done ? '✓' : num}
              </div>
              <span className={`text-xs hidden sm:block ${active ? 'text-clay font-medium' : 'text-stone/60'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-px mb-4 ${num < step ? 'bg-forest' : 'bg-stone/20'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1: Dates & House ────────────────────────────────
function Step1({ form, setForm, onNext }: {
  form: BookingForm
  setForm: (f: BookingForm) => void
  onNext: () => void
}) {
  const today    = format(new Date(), 'yyyy-MM-dd')
  const maxDate  = format(addDays(new Date(), 365), 'yyyy-MM-dd')
  const [error, setError] = useState('')

  function handleDates(field: 'checkIn' | 'checkOut', value: string) {
    const updated = { ...form, [field]: value }
    if (updated.checkIn && updated.checkOut) {
      const nights = differenceInDays(new Date(updated.checkOut), new Date(updated.checkIn))
      if (nights < 1) { setError('Check-out must be after check-in'); return }
      const subtotal    = HOUSE1_RATE * nights
      const total       = subtotal + CLEANING_FEE
      const downpayment = Math.ceil(total * (DOWNPAYMENT_PCT / 100))
      updated.nights      = nights
      updated.totalAmount = total
      updated.downpayment = downpayment
      updated.cleaningFee = CLEANING_FEE
      setError('')
    }
    setForm(updated)
  }

  const canNext = form.checkIn && form.checkOut && form.nights > 0 && !error

  return (
    <div>
      <h2 className="text-2xl font-display text-forest mb-2">Choose your dates</h2>
      <p className="text-stone mb-6">House 1 is available for exclusive full-estate bookings.</p>

      {/* House card */}
      <div className="card border-2 border-forest mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-forest/10 flex items-center justify-center text-2xl flex-shrink-0">🏡</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-forest text-lg">House 1</h3>
              <span className="text-xs bg-leaf/20 text-forest px-2 py-0.5 rounded-full">Available</span>
            </div>
            <p className="text-stone text-sm mb-2">Up to {MAX_GUESTS} guests · Full estate access</p>
            <div className="flex flex-wrap gap-2">
              {['🏊 Pool', '🏛️ Mini landmarks', '⛺ Camping', '🌳 5,640 sqm estate'].map(a => (
                <span key={a} className="text-xs bg-cream-dark text-stone px-2 py-1 rounded-full">{a}</span>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-forest font-medium">{formatPeso(HOUSE1_RATE)}</div>
            <div className="text-stone text-xs">per night</div>
          </div>
        </div>
      </div>

      {/* Date pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-stone mb-1.5 font-medium">Check-in date</label>
          <input
            type="date"
            className="input"
            min={today}
            max={maxDate}
            value={form.checkIn}
            onChange={e => handleDates('checkIn', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-stone mb-1.5 font-medium">Check-out date</label>
          <input
            type="date"
            className="input"
            min={form.checkIn || today}
            max={maxDate}
            value={form.checkOut}
            onChange={e => handleDates('checkOut', e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Summary */}
      {form.nights > 0 && (
        <div className="bg-forest/5 border border-forest/20 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone">{formatPeso(HOUSE1_RATE)} × {form.nights} night{form.nights > 1 ? 's' : ''}</span>
            <span className="text-stone-dark">{formatPeso(HOUSE1_RATE * form.nights)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone">Cleaning fee</span>
            <span className="text-stone-dark">{formatPeso(CLEANING_FEE)}</span>
          </div>
          <div className="border-t border-forest/20 pt-2 mt-2 flex justify-between font-medium">
            <span className="text-forest">Total</span>
            <span className="text-forest">{formatPeso(form.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-stone">Downpayment ({DOWNPAYMENT_PCT}%)</span>
            <span className="text-clay font-medium">{formatPeso(form.downpayment)}</span>
          </div>
        </div>
      )}

      {/* Guests */}
      <div className="mb-6">
        <label className="block text-sm text-stone mb-1.5 font-medium">Number of guests</label>
        <select
          className="input"
          value={form.guests}
          onChange={e => setForm({ ...form, guests: Number(e.target.value) })}
        >
          <option value={0}>Select number of guests</option>
          {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      <button
        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={!canNext || form.guests === 0}
        onClick={onNext}
      >
        Next: Guest details →
      </button>
    </div>
  )
}

// ─── Step 2: Guest Details ────────────────────────────────
function Step2({ form, setForm, onNext, onBack }: {
  form: BookingForm
  setForm: (f: BookingForm) => void
  onNext: () => void
  onBack: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())  e.name  = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
    if (!form.phone.trim()) e.phone = 'Contact number is required'
    else if (!/^(09|\+639)\d{9}$/.test(form.phone.replace(/[\s\-]/g, '')))
      e.phone = 'Enter a valid PH number (e.g. 09XX XXX XXXX)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  return (
    <div>
      <h2 className="text-2xl font-display text-forest mb-2">Guest details</h2>
      <p className="text-stone mb-6">Tell us who's staying so we can prepare for your arrival.</p>

      <div className="card mb-6">
        <div className="mb-4">
          <label className="block text-sm text-stone mb-1.5 font-medium">Full name *</label>
          <input
            type="text"
            className={`input ${errors.name ? 'border-red-400' : ''}`}
            placeholder="Juan dela Cruz"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-stone mb-1.5 font-medium">Email address *</label>
          <input
            type="email"
            className={`input ${errors.email ? 'border-red-400' : ''}`}
            placeholder="juan@email.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-stone mb-1.5 font-medium">Contact number *</label>
          <input
            type="tel"
            className={`input ${errors.phone ? 'border-red-400' : ''}`}
            placeholder="09XX XXX XXXX"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm text-stone mb-1.5 font-medium">Special requests <span className="text-stone/50">(optional)</span></label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="Early check-in, extra bedding, celebrating a birthday..."
            value={form.specialRequests}
            onChange={e => setForm({ ...form, specialRequests: e.target.value })}
          />
        </div>
      </div>

      {/* Booking summary */}
      <div className="bg-cream-dark rounded-xl p-4 mb-6 text-sm">
        <div className="font-medium text-forest mb-2">Booking summary</div>
        <div className="flex justify-between mb-1"><span className="text-stone">House</span><span>House 1</span></div>
        <div className="flex justify-between mb-1"><span className="text-stone">Check-in</span><span>{format(new Date(form.checkIn), 'MMM d, yyyy')}</span></div>
        <div className="flex justify-between mb-1"><span className="text-stone">Check-out</span><span>{format(new Date(form.checkOut), 'MMM d, yyyy')}</span></div>
        <div className="flex justify-between mb-1"><span className="text-stone">Nights</span><span>{form.nights}</span></div>
        <div className="flex justify-between mb-1"><span className="text-stone">Guests</span><span>{form.guests}</span></div>
        <div className="flex justify-between font-medium border-t border-stone/20 pt-2 mt-2"><span className="text-forest">Total</span><span className="text-forest">{formatPeso(form.totalAmount)}</span></div>
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={onBack}>← Back</button>
        <button className="btn-primary flex-1" onClick={handleNext}>Next: Payment →</button>
      </div>
    </div>
  )
}

// ─── Step 3: Payment ──────────────────────────────────────
function Step3({ form, setForm, onNext, onBack, loading }: {
  form: BookingForm
  setForm: (f: BookingForm) => void
  onNext: () => void
  onBack: () => void
  loading: boolean
}) {
  const payMethods = [
    { id: 'GCash',         icon: '📱', label: 'GCash',          desc: 'Send to our GCash number after approval' },
    { id: 'Bank Transfer', icon: '🏦', label: 'Bank Transfer',  desc: 'BDO/BPI details sent after approval' },
    { id: 'PayMongo',      icon: '💳', label: 'Card / GCash Link', desc: 'Pay securely online via PayMongo' },
    { id: 'Pay on Arrival',icon: '💵', label: 'Pay on Arrival', desc: 'Downpayment may be required to hold slot' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-display text-forest mb-2">Payment method</h2>
      <p className="text-stone mb-6">Choose how you'd like to pay your downpayment of <strong className="text-clay">{formatPeso(form.downpayment)}</strong>.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {payMethods.map(m => (
          <button
            key={m.id}
            onClick={() => setForm({ ...form, paymentMethod: m.id })}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              form.paymentMethod === m.id
                ? 'border-forest bg-forest/5'
                : 'border-stone/20 bg-white hover:border-stone/40'
            }`}
          >
            <div className="text-2xl mb-2">{m.icon}</div>
            <div className={`font-medium text-sm mb-1 ${form.paymentMethod === m.id ? 'text-forest' : 'text-stone-dark'}`}>{m.label}</div>
            <div className="text-xs text-stone">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Final summary */}
      <div className="card mb-6">
        <div className="font-medium text-forest mb-3">Final booking summary</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-stone">Guest</span><span>{form.name}</span></div>
          <div className="flex justify-between"><span className="text-stone">House</span><span>House 1</span></div>
          <div className="flex justify-between"><span className="text-stone">Check-in</span><span>{format(new Date(form.checkIn), 'MMM d, yyyy')}</span></div>
          <div className="flex justify-between"><span className="text-stone">Check-out</span><span>{format(new Date(form.checkOut), 'MMM d, yyyy')}</span></div>
          <div className="flex justify-between"><span className="text-stone">Nights</span><span>{form.nights}</span></div>
          <div className="flex justify-between"><span className="text-stone">Guests</span><span>{form.guests}</span></div>
          <div className="flex justify-between"><span className="text-stone">Room rate</span><span>{formatPeso(HOUSE1_RATE * form.nights)}</span></div>
          <div className="flex justify-between"><span className="text-stone">Cleaning fee</span><span>{formatPeso(CLEANING_FEE)}</span></div>
          <div className="flex justify-between font-medium border-t border-stone/20 pt-2 mt-1">
            <span className="text-forest">Total amount</span>
            <span className="text-forest">{formatPeso(form.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-clay font-medium">
            <span>Downpayment due ({DOWNPAYMENT_PCT}%)</span>
            <span>{formatPeso(form.downpayment)}</span>
          </div>
          <div className="flex justify-between text-stone/60">
            <span>Balance (on arrival)</span>
            <span>{formatPeso(form.totalAmount - form.downpayment)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={onBack} disabled={loading}>← Back</button>
        <button
          className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={!form.paymentMethod || loading}
        >
          {loading ? 'Submitting...' : 'Submit booking request →'}
        </button>
      </div>
    </div>
  )
}

// ─── Step 4: Confirmation ─────────────────────────────────
function Step4({ form, bookingId }: { form: BookingForm; bookingId: string }) {
  return (
    <div className="text-center py-4">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-display text-forest mb-2">Booking request sent!</h2>
      <p className="text-stone mb-6">Thank you, <strong>{form.name}</strong>! Your request has been received.</p>

      <div className="card text-left mb-6">
        <div className="text-center mb-4">
          <div className="text-xs text-stone mb-1">Booking reference</div>
          <div className="text-xl font-mono font-bold text-forest">{bookingId}</div>
        </div>
        <div className="space-y-2 text-sm border-t border-stone/20 pt-4">
          <div className="flex justify-between"><span className="text-stone">House</span><span>House 1</span></div>
          <div className="flex justify-between"><span className="text-stone">Check-in</span><span>{format(new Date(form.checkIn), 'MMM d, yyyy')}</span></div>
          <div className="flex justify-between"><span className="text-stone">Check-out</span><span>{format(new Date(form.checkOut), 'MMM d, yyyy')}</span></div>
          <div className="flex justify-between"><span className="text-stone">Guests</span><span>{form.guests}</span></div>
          <div className="flex justify-between"><span className="text-stone">Total</span><span className="font-medium text-forest">{formatPeso(form.totalAmount)}</span></div>
          <div className="flex justify-between"><span className="text-stone">Downpayment</span><span className="font-medium text-clay">{formatPeso(form.downpayment)}</span></div>
          <div className="flex justify-between"><span className="text-stone">Payment via</span><span>{form.paymentMethod}</span></div>
        </div>
      </div>

      <div className="bg-forest/5 border border-forest/20 rounded-xl p-4 text-sm text-stone text-left mb-6">
        <div className="font-medium text-forest mb-2">What happens next?</div>
        <ol className="space-y-1.5 list-decimal list-inside">
          <li>The owner will review your request within 2–4 hours</li>
          <li>You'll receive a confirmation email at <strong>{form.email}</strong></li>
          <li>Payment instructions will be sent upon approval</li>
          <li>Property address and directions sent after downpayment</li>
        </ol>
      </div>

      <a href="/" className="btn-primary inline-block">Back to home</a>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function BookingPage() {
  const [step, setStep]      = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState('')
  const [error, setError]    = useState('')

  const [form, setForm] = useState<BookingForm>({
    house:           'House 1',
    checkIn:         '',
    checkOut:        '',
    nights:          0,
    guests:          0,
    name:            '',
    email:           '',
    phone:           '',
    specialRequests: '',
    paymentMethod:   '',
    totalAmount:     0,
    downpayment:     0,
    cleaningFee:     CLEANING_FEE,
  })

  async function submitBooking() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          house:           form.house,
          checkIn:         form.checkIn,
          checkOut:        form.checkOut,
          nights:          form.nights,
          guests:          form.guests,
          guestName:       form.name,
          email:           form.email,
          phone:           form.phone,
          specialRequests: form.specialRequests,
          paymentMethod:   form.paymentMethod,
          totalAmount:     form.totalAmount,
          downpayment:     form.downpayment,
          balance:         form.totalAmount - form.downpayment,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setBookingId(data.data.id)
        setStep(4)
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Could not connect. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="text-stone/60 text-sm hover:text-forest transition-colors">← Back to home</a>
          <h1 className="text-3xl font-display text-forest mt-2">Book your stay</h1>
          <p className="text-stone text-sm mt-1">General Emilio Aguinaldo, Cavite · 45 mins from Tagaytay</p>
        </div>

        {step < 4 && <StepIndicator step={step} />}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="card">
          {step === 1 && <Step1 form={form} setForm={setForm} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 form={form} setForm={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <Step3 form={form} setForm={setForm} onNext={submitBooking} onBack={() => setStep(2)} loading={loading} />}
          {step === 4 && <Step4 form={form} bookingId={bookingId} />}
        </div>

        <p className="text-center text-xs text-stone/50 mt-6">
          Questions? Message us on <a href="#" className="underline hover:text-forest">Facebook</a>
        </p>
      </div>
    </main>
  )
}
