import { NextRequest, NextResponse } from 'next/server'
import { createBooking, getAllBookings } from '@/lib/sheets'
import { sendBookingReceivedEmail, sendOwnerNewBookingAlert } from '@/lib/email'

// GET /api/bookings — list all bookings (dashboard use)
export async function GET() {
  try {
    const bookings = await getAllBookings()
    return NextResponse.json({ success: true, data: bookings })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// POST /api/bookings — create a new booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    const required = ['house','checkIn','checkOut','nights','guests','guestName','email','phone','paymentMethod','totalAmount','downpayment','balance']
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json({ success: false, error: `Missing field: ${field}` }, { status: 400 })
      }
    }

    const booking = await createBooking({
      house:           body.house,
      checkIn:         body.checkIn,
      checkOut:        body.checkOut,
      nights:          body.nights,
      guests:          body.guests,
      guestName:       body.guestName,
      email:           body.email,
      phone:           body.phone,
      specialRequests: body.specialRequests || '',
      notes:           '',
      paymentMethod:   body.paymentMethod,
      paymentStatus:   'Unpaid',
      bookingStatus:   'Pending',
      totalAmount:     body.totalAmount,
      downpayment:     body.downpayment,
      balance:         body.balance,
      calendarEventId: '',
    })

    // Send emails (non-blocking — don't fail if email fails)
    try {
      await sendBookingReceivedEmail(booking)
      await sendOwnerNewBookingAlert(booking)
    } catch (emailErr) {
      console.error('Email send failed (non-fatal):', emailErr)
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
