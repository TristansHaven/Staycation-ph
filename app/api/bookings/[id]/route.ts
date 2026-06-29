import { NextRequest, NextResponse } from 'next/server'
import { getBookingById, updateBooking } from '@/lib/sheets'
import { blockDates, addCleaningBlock, unblockDates } from '@/lib/calendar'
import { sendBookingConfirmedEmail, sendBookingDeclinedEmail } from '@/lib/email'

// GET /api/bookings/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const booking = await getBookingById(params.id)
    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// PATCH /api/bookings/[id] — update status, payment, notes
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body    = await req.json()
    const booking = await getBookingById(params.id)
    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })

    // Handle status changes with side effects
    if (body.bookingStatus === 'Confirmed' && booking.bookingStatus !== 'Confirmed') {
      // Block dates on Google Calendar
      try {
        const eventId = await blockDates(booking.house, booking.checkIn, booking.checkOut, booking.guestName, booking.id)
        if (eventId) body.calendarEventId = eventId
        await addCleaningBlock(booking.house, booking.checkOut)
      } catch (calErr) {
        console.error('Calendar block failed (non-fatal):', calErr)
      }
      // Send confirmation email
      try { await sendBookingConfirmedEmail({ ...booking, ...body }) } catch {}
    }

    if (body.bookingStatus === 'Declined' && booking.bookingStatus !== 'Declined') {
      try { await sendBookingDeclinedEmail(booking) } catch {}
    }

    if (body.bookingStatus === 'Cancelled' && booking.calendarEventId) {
      try { await unblockDates(booking.house, booking.calendarEventId) } catch {}
    }

    const updated = await updateBooking(params.id, body)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
