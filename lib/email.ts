// lib/email.ts — Nodemailer email helpers (fully implemented in Phase 3)
import nodemailer from 'nodemailer'
import type { Booking } from '@/types'

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

const PROPERTY_NAME = process.env.PROPERTY_NAME || 'Staycation PH'
const OWNER_EMAIL   = process.env.OWNER_EMAIL   || ''

/** Send booking request received email to guest */
export async function sendBookingReceivedEmail(booking: Booking): Promise<void> {
  const transporter = getTransporter()
  await transporter.sendMail({
    from:    `"${PROPERTY_NAME}" <${process.env.GMAIL_USER}>`,
    to:      booking.email,
    subject: `Booking Request Received — ${booking.id}`,
    html: `
      <p>Hi ${booking.guestName},</p>
      <p>We received your booking request for <strong>${booking.house}</strong> 
         from <strong>${booking.checkIn}</strong> to <strong>${booking.checkOut}</strong>.</p>
      <p>Your booking reference is: <strong>${booking.id}</strong></p>
      <p>We'll review and confirm within 2–4 hours. We'll send payment instructions once confirmed.</p>
      <p>Questions? Message us on Facebook or reply to this email.</p>
      <p>— The ${PROPERTY_NAME} Team</p>
    `,
  })
}

/** Send booking confirmed email to guest */
export async function sendBookingConfirmedEmail(booking: Booking): Promise<void> {
  const transporter = getTransporter()
  await transporter.sendMail({
    from:    `"${PROPERTY_NAME}" <${process.env.GMAIL_USER}>`,
    to:      booking.email,
    subject: `Booking Confirmed ✓ — ${booking.id}`,
    html: `
      <p>Hi ${booking.guestName},</p>
      <p>Great news — your booking is <strong>confirmed</strong>! 🎉</p>
      <p><strong>Booking Details:</strong></p>
      <ul>
        <li>Reference: ${booking.id}</li>
        <li>House: ${booking.house}</li>
        <li>Check-in: ${booking.checkIn} at ${process.env.CHECKIN_TIME}</li>
        <li>Check-out: ${booking.checkOut} at ${process.env.CHECKOUT_TIME}</li>
        <li>Guests: ${booking.guests}</li>
        <li>Total: ₱${booking.totalAmount.toLocaleString()}</li>
      </ul>
      <p><strong>Payment Due:</strong><br/>
         Downpayment of ₱${booking.downpayment.toLocaleString()} via ${booking.paymentMethod}.<br/>
         Details will follow in a separate message.</p>
      <p><strong>Exact address and pin location</strong> will be sent after downpayment is received.</p>
      <p>See you soon!</p>
      <p>— The ${PROPERTY_NAME} Team</p>
    `,
  })
}

/** Send booking declined email to guest */
export async function sendBookingDeclinedEmail(booking: Booking): Promise<void> {
  const transporter = getTransporter()
  await transporter.sendMail({
    from:    `"${PROPERTY_NAME}" <${process.env.GMAIL_USER}>`,
    to:      booking.email,
    subject: `Booking Update — ${booking.id}`,
    html: `
      <p>Hi ${booking.guestName},</p>
      <p>Unfortunately, we're unable to accommodate your booking for the requested dates.</p>
      <p>We'd love to host you another time — please check our availability calendar and book different dates.</p>
      <p>Sorry for the inconvenience!</p>
      <p>— The ${PROPERTY_NAME} Team</p>
    `,
  })
}

/** Alert the owner of a new booking */
export async function sendOwnerNewBookingAlert(booking: Booking): Promise<void> {
  if (!OWNER_EMAIL) return
  const transporter = getTransporter()
  await transporter.sendMail({
    from:    `"${PROPERTY_NAME} Alerts" <${process.env.GMAIL_USER}>`,
    to:      OWNER_EMAIL,
    subject: `🔔 New Booking Request — ${booking.id}`,
    html: `
      <p>New booking request received!</p>
      <ul>
        <li>ID: ${booking.id}</li>
        <li>Guest: ${booking.guestName} (${booking.email} / ${booking.phone})</li>
        <li>House: ${booking.house}</li>
        <li>Check-in: ${booking.checkIn}</li>
        <li>Check-out: ${booking.checkOut}</li>
        <li>Nights: ${booking.nights}</li>
        <li>Guests: ${booking.guests}</li>
        <li>Total: ₱${booking.totalAmount.toLocaleString()}</li>
        <li>Payment: ${booking.paymentMethod}</li>
      </ul>
      <p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/bookings?id=${booking.id}">
          Review in Dashboard →
        </a>
      </p>
    `,
  })
}
