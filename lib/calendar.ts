// lib/calendar.ts
// Google Calendar helpers — implemented in Phase 2.
// Stubs are here so imports don't break in Phase 1.

import { google } from 'googleapis'
import type { HouseChoice } from '@/types'

async function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key:  process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
  const authClient = await auth.getClient()
  return google.calendar({ version: 'v3', auth: authClient as never })
}

function getCalendarId(house: HouseChoice): string {
  if (house === 'House 1')     return process.env.GOOGLE_CALENDAR_ID_HOUSE1!
  if (house === 'House 2')     return process.env.GOOGLE_CALENDAR_ID_HOUSE2!
  return process.env.GOOGLE_CALENDAR_ID_HOUSE1! // Both Houses: use House 1 as primary
}

/** Check if a house is available for the given date range */
export async function checkAvailability(
  house: HouseChoice,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  try {
    const calendar   = await getCalendarClient()
    const calendarId = getCalendarId(house)

    const res = await calendar.events.list({
      calendarId,
      timeMin: new Date(checkIn).toISOString(),
      timeMax: new Date(checkOut).toISOString(),
      singleEvents: true,
    })

    const events = res.data.items || []
    // If any events exist in this range, dates are not available
    return events.length === 0
  } catch {
    // If calendar check fails, don't block the booking — fail open
    console.error('Calendar availability check failed, defaulting to available')
    return true
  }
}

/** Block dates on Google Calendar when a booking is confirmed */
export async function blockDates(
  house: HouseChoice,
  checkIn: string,
  checkOut: string,
  guestName: string,
  bookingId: string
): Promise<string | null> {
  try {
    const calendar   = await getCalendarClient()
    const calendarId = getCalendarId(house)

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary:     `${guestName} — ${house} [${bookingId}]`,
        description: `Booking ID: ${bookingId}\nGuest: ${guestName}`,
        start: { date: checkIn },
        end:   { date: checkOut },
        colorId: house === 'House 1' ? '1' : '2', // Blue = House 1, Green = House 2
      },
    })

    return event.data.id || null
  } catch (err) {
    console.error('Failed to block calendar dates:', err)
    return null
  }
}

/** Remove calendar block when a booking is cancelled */
export async function unblockDates(
  house: HouseChoice,
  eventId: string
): Promise<void> {
  try {
    const calendar   = await getCalendarClient()
    const calendarId = getCalendarId(house)
    await calendar.events.delete({ calendarId, eventId })
  } catch (err) {
    console.error('Failed to unblock calendar dates:', err)
  }
}

/** Add a cleaning hold day after checkout */
export async function addCleaningBlock(
  house: HouseChoice,
  checkOut: string
): Promise<void> {
  try {
    const calendar   = await getCalendarClient()
    const calendarId = getCalendarId(house)

    // Cleaning day = checkout date, ends next day
    const cleanDate = new Date(checkOut)
    const nextDay   = new Date(cleanDate)
    nextDay.setDate(nextDay.getDate() + 1)

    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary:  `🧹 Cleaning — ${house}`,
        start: { date: cleanDate.toISOString().split('T')[0] },
        end:   { date: nextDay.toISOString().split('T')[0] },
        colorId: '8', // Graphite
      },
    })
  } catch (err) {
    console.error('Failed to add cleaning block:', err)
  }
}
