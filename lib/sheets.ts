// ============================================================
// lib/sheets.ts
// Google Sheets API helpers — acts as the database for the app.
// All bookings, inquiries, and expenses are stored in Google Sheets.
// ============================================================

import { google, sheets_v4 } from 'googleapis'
import { format } from 'date-fns'
import type {
  Booking,
  BookingStatus,
  PaymentStatus,
  Inquiry,
  InquiryStatus,
  Expense,
  PropertySettings,
  DashboardStats,
  HouseChoice,
  PaymentMethod,
  ExpenseCategory,
} from '@/types'

// ─── Tab names (must match your Google Sheet exactly) ────
const TABS = {
  BOOKINGS:   'Bookings',
  INQUIRIES:  'Inquiries',
  EXPENSES:   'Expenses',
  SETTINGS:   'Settings',
} as const

// ─── Column definitions ──────────────────────────────────
// These match the header row order in each sheet tab.

const BOOKING_COLS = [
  'ID', 'Date Submitted', 'Guest Name', 'Email', 'Phone',
  'House', 'Check-in', 'Check-out', 'Nights', 'Guests',
  'Total Amount', 'Downpayment', 'Balance',
  'Payment Method', 'Payment Status', 'Booking Status',
  'Special Requests', 'Notes', 'Calendar Event ID',
] as const

const INQUIRY_COLS = [
  'ID', 'Timestamp', 'Name', 'Email', 'Phone',
  'Message', 'AI Reply', 'Owner Reply', 'Status',
] as const

const EXPENSE_COLS = [
  'ID', 'Date', 'Category', 'Description', 'Amount', 'Paid By', 'Receipt Ref',
] as const

// ─── Auth & client setup ─────────────────────────────────

/**
 * Returns an authenticated Google Sheets client.
 * Uses a service account — credentials are stored in env vars.
 */
async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key:  process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar',
    ],
  })

  const authClient = await auth.getClient()
  return google.sheets({ version: 'v4', auth: authClient as never })
}

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!

// ─── Utility helpers ─────────────────────────────────────

/** Generate a unique booking ID: BK-YYYYMMDD-XXXX */
export function generateBookingId(): string {
  const date = format(new Date(), 'yyyyMMdd')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BK-${date}-${rand}`
}

/** Generate a unique inquiry ID: INQ-timestamp */
export function generateInquiryId(): string {
  return `INQ-${Date.now()}`
}

/** Generate a unique expense ID: EXP-timestamp */
export function generateExpenseId(): string {
  return `EXP-${Date.now()}`
}

/** Convert a row array to a Booking object */
function rowToBooking(row: string[]): Booking {
  return {
    id:              row[0]  || '',
    dateSubmitted:   row[1]  || '',
    guestName:       row[2]  || '',
    email:           row[3]  || '',
    phone:           row[4]  || '',
    house:           (row[5]  || 'House 1') as HouseChoice,
    checkIn:         row[6]  || '',
    checkOut:        row[7]  || '',
    nights:          Number(row[8])  || 0,
    guests:          Number(row[9])  || 0,
    totalAmount:     Number(row[10]) || 0,
    downpayment:     Number(row[11]) || 0,
    balance:         Number(row[12]) || 0,
    paymentMethod:   (row[13] || 'GCash') as PaymentMethod,
    paymentStatus:   (row[14] || 'Unpaid') as PaymentStatus,
    bookingStatus:   (row[15] || 'Pending') as BookingStatus,
    specialRequests: row[16] || '',
    notes:           row[17] || '',
    calendarEventId: row[18] || '',
  }
}

/** Convert a row array to an Inquiry object */
function rowToInquiry(row: string[]): Inquiry {
  return {
    id:          row[0] || '',
    timestamp:   row[1] || '',
    name:        row[2] || '',
    email:       row[3] || '',
    phone:       row[4] || '',
    message:     row[5] || '',
    aiReply:     row[6] || '',
    ownerReply:  row[7] || '',
    status:      (row[8] || 'New') as InquiryStatus,
  }
}

/** Convert a row array to an Expense object */
function rowToExpense(row: string[]): Expense {
  return {
    id:          row[0] || '',
    date:        row[1] || '',
    category:    (row[2] || 'Other') as ExpenseCategory,
    description: row[3] || '',
    amount:      Number(row[4]) || 0,
    paidBy:      row[5] || '',
    receiptRef:  row[6] || '',
  }
}

// ─── Sheet initialisation ────────────────────────────────

/**
 * Creates all required tabs and header rows if they don't exist yet.
 * Call this once during initial setup or on first run.
 */
export async function initializeSheets(): Promise<void> {
  const sheets = await getSheetsClient()

  // Get existing sheet names
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
  const existingTabs = meta.data.sheets?.map(s => s.properties?.title) || []

  const requests: sheets_v4.Schema$Request[] = []

  // Add missing tabs
  const tabsToCreate = Object.values(TABS).filter(t => !existingTabs.includes(t))
  for (const title of tabsToCreate) {
    requests.push({ addSheet: { properties: { title } } })
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests },
    })
  }

  // Write header rows to each tab (only if they're empty)
  const headers: Record<string, string[]> = {
    [TABS.BOOKINGS]:  [...BOOKING_COLS],
    [TABS.INQUIRIES]: [...INQUIRY_COLS],
    [TABS.EXPENSES]:  [...EXPENSE_COLS],
    [TABS.SETTINGS]:  ['Key', 'Value'],
  }

  for (const [tab, headerRow] of Object.entries(headers)) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tab}!A1:A1`,
    })
    // Only write headers if the first cell is empty
    if (!res.data.values?.[0]?.[0]) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tab}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headerRow] },
      })
    }
  }

  // Seed default settings if Settings tab is empty
  const settingsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.SETTINGS}!A2:B2`,
  })
  if (!settingsRes.data.values?.[0]) {
    const defaultSettings = [
      ['house1Rate',         process.env.HOUSE1_RATE         || '8000'],
      ['house2Rate',         process.env.HOUSE2_RATE         || '6000'],
      ['bothHousesRate',     process.env.BOTH_HOUSES_RATE    || '13000'],
      ['cleaningFee',        process.env.CLEANING_FEE        || '500'],
      ['downpaymentPercent', process.env.DOWNPAYMENT_PERCENT || '30'],
      ['house1MaxGuests',    process.env.HOUSE1_MAX_GUESTS   || '15'],
      ['house2MaxGuests',    process.env.HOUSE2_MAX_GUESTS   || '10'],
      ['checkinTime',        process.env.CHECKIN_TIME        || '14:00'],
      ['checkoutTime',       process.env.CHECKOUT_TIME       || '11:00'],
      ['minNights',          process.env.MIN_NIGHTS          || '1'],
    ]
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TABS.SETTINGS}!A2`,
      valueInputOption: 'RAW',
      requestBody: { values: defaultSettings },
    })
  }
}

// ─── BOOKINGS ─────────────────────────────────────────────

/** Fetch all bookings, newest first */
export async function getAllBookings(): Promise<Booking[]> {
  const sheets = await getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.BOOKINGS}!A2:S`, // skip header row
  })
  const rows = res.data.values || []
  return rows
    .filter(row => row[0]) // skip empty rows
    .map(row => rowToBooking(row.map(String)))
    .reverse() // newest first
}

/** Fetch a single booking by ID */
export async function getBookingById(id: string): Promise<Booking | null> {
  const all = await getAllBookings()
  return all.find(b => b.id === id) || null
}

/** Fetch bookings filtered by status */
export async function getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
  const all = await getAllBookings()
  return all.filter(b => b.bookingStatus === status)
}

/** Fetch bookings for a specific house and date range (for availability check) */
export async function getBookingsForHouse(
  house: HouseChoice,
  from: string,
  to: string
): Promise<Booking[]> {
  const all = await getAllBookings()
  return all.filter(b => {
    if (b.bookingStatus === 'Cancelled' || b.bookingStatus === 'Declined') return false
    // Check if this booking overlaps with the requested range
    const matches = b.house === house || b.house === 'Both Houses' || house === 'Both Houses'
    const overlaps = b.checkIn < to && b.checkOut > from
    return matches && overlaps
  })
}

/** Create a new booking — appends a row to the Bookings sheet */
export async function createBooking(
  data: Omit<Booking, 'id' | 'dateSubmitted'>
): Promise<Booking> {
  const sheets  = await getSheetsClient()
  const id      = generateBookingId()
  const dateStr = new Date().toISOString()

  const booking: Booking = { id, dateSubmitted: dateStr, ...data }

  const row = [
    booking.id,
    booking.dateSubmitted,
    booking.guestName,
    booking.email,
    booking.phone,
    booking.house,
    booking.checkIn,
    booking.checkOut,
    booking.nights,
    booking.guests,
    booking.totalAmount,
    booking.downpayment,
    booking.balance,
    booking.paymentMethod,
    booking.paymentStatus,
    booking.bookingStatus,
    booking.specialRequests || '',
    booking.notes || '',
    booking.calendarEventId || '',
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.BOOKINGS}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })

  return booking
}

/** Update specific fields of a booking by ID */
export async function updateBooking(
  id: string,
  updates: Partial<Booking>
): Promise<Booking | null> {
  const sheets = await getSheetsClient()

  // Find the row number (1-based, +1 for header row)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.BOOKINGS}!A2:S`,
  })
  const rows  = res.data.values || []
  const index = rows.findIndex(r => r[0] === id)
  if (index === -1) return null

  const rowNum     = index + 2 // +1 for 0-index, +1 for header
  const existing   = rowToBooking(rows[index].map(String))
  const updated: Booking = { ...existing, ...updates }

  const newRow = [
    updated.id,
    updated.dateSubmitted,
    updated.guestName,
    updated.email,
    updated.phone,
    updated.house,
    updated.checkIn,
    updated.checkOut,
    updated.nights,
    updated.guests,
    updated.totalAmount,
    updated.downpayment,
    updated.balance,
    updated.paymentMethod,
    updated.paymentStatus,
    updated.bookingStatus,
    updated.specialRequests || '',
    updated.notes || '',
    updated.calendarEventId || '',
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.BOOKINGS}!A${rowNum}:S${rowNum}`,
    valueInputOption: 'RAW',
    requestBody: { values: [newRow] },
  })

  return updated
}

// ─── INQUIRIES ────────────────────────────────────────────

/** Get all inquiries, newest first */
export async function getAllInquiries(): Promise<Inquiry[]> {
  const sheets = await getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.INQUIRIES}!A2:I`,
  })
  const rows = res.data.values || []
  return rows
    .filter(row => row[0])
    .map(row => rowToInquiry(row.map(String)))
    .reverse()
}

/** Save a new inquiry (from chat widget or contact form) */
export async function createInquiry(
  data: Omit<Inquiry, 'id' | 'timestamp' | 'status'>
): Promise<Inquiry> {
  const sheets = await getSheetsClient()
  const id     = generateInquiryId()
  const ts     = new Date().toISOString()

  const inquiry: Inquiry = {
    id,
    timestamp: ts,
    status: 'New',
    ...data,
  }

  const row = [
    inquiry.id,
    inquiry.timestamp,
    inquiry.name,
    inquiry.email,
    inquiry.phone || '',
    inquiry.message,
    inquiry.aiReply || '',
    inquiry.ownerReply || '',
    inquiry.status,
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.INQUIRIES}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })

  return inquiry
}

/** Update an inquiry (e.g. save AI reply, mark as closed) */
export async function updateInquiry(
  id: string,
  updates: Partial<Inquiry>
): Promise<Inquiry | null> {
  const sheets = await getSheetsClient()

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.INQUIRIES}!A2:I`,
  })
  const rows  = res.data.values || []
  const index = rows.findIndex(r => r[0] === id)
  if (index === -1) return null

  const rowNum   = index + 2
  const existing = rowToInquiry(rows[index].map(String))
  const updated: Inquiry = { ...existing, ...updates }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.INQUIRIES}!A${rowNum}:I${rowNum}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        updated.id,
        updated.timestamp,
        updated.name,
        updated.email,
        updated.phone || '',
        updated.message,
        updated.aiReply || '',
        updated.ownerReply || '',
        updated.status,
      ]],
    },
  })

  return updated
}

// ─── EXPENSES ─────────────────────────────────────────────

/** Get all expenses */
export async function getAllExpenses(): Promise<Expense[]> {
  const sheets = await getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.EXPENSES}!A2:G`,
  })
  const rows = res.data.values || []
  return rows
    .filter(row => row[0])
    .map(row => rowToExpense(row.map(String)))
    .reverse()
}

/** Add a new expense entry */
export async function createExpense(
  data: Omit<Expense, 'id'>
): Promise<Expense> {
  const sheets  = await getSheetsClient()
  const expense: Expense = { id: generateExpenseId(), ...data }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.EXPENSES}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[
        expense.id,
        expense.date,
        expense.category,
        expense.description,
        expense.amount,
        expense.paidBy,
        expense.receiptRef || '',
      ]],
    },
  })

  return expense
}

// ─── SETTINGS ─────────────────────────────────────────────

/** Get all property settings as a typed object */
export async function getSettings(): Promise<PropertySettings> {
  const sheets = await getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.SETTINGS}!A2:B20`,
  })

  const rows = res.data.values || []
  const map: Record<string, string> = {}
  for (const row of rows) {
    if (row[0]) map[row[0]] = row[1] || ''
  }

  return {
    house1Rate:         Number(map.house1Rate)         || 8000,
    house2Rate:         Number(map.house2Rate)         || 6000,
    bothHousesRate:     Number(map.bothHousesRate)     || 13000,
    cleaningFee:        Number(map.cleaningFee)        || 500,
    downpaymentPercent: Number(map.downpaymentPercent) || 30,
    house1MaxGuests:    Number(map.house1MaxGuests)    || 15,
    house2MaxGuests:    Number(map.house2MaxGuests)    || 10,
    checkinTime:        map.checkinTime                || '14:00',
    checkoutTime:       map.checkoutTime               || '11:00',
    minNights:          Number(map.minNights)          || 1,
  }
}

/** Update a single setting value */
export async function updateSetting(key: string, value: string): Promise<void> {
  const sheets = await getSheetsClient()

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TABS.SETTINGS}!A2:B20`,
  })
  const rows  = res.data.values || []
  const index = rows.findIndex(r => r[0] === key)

  if (index === -1) {
    // Key doesn't exist yet — append it
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TABS.SETTINGS}!A1`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[key, value]] },
    })
  } else {
    // Update existing key
    const rowNum = index + 2
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TABS.SETTINGS}!B${rowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[value]] },
    })
  }
}

// ─── DASHBOARD STATS ──────────────────────────────────────

/** Compute stats for the dashboard home page */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [bookings, settings] = await Promise.all([
    getAllBookings(),
    getSettings(),
  ])

  const now       = new Date()
  const monthStr  = format(now, 'yyyy-MM')

  // Filter to this month's confirmed bookings
  const thisMonth = bookings.filter(b =>
    b.dateSubmitted.startsWith(monthStr) && b.bookingStatus === 'Confirmed'
  )

  const revenueThisMonth  = thisMonth.reduce((sum, b) => sum + b.totalAmount, 0)
  const pendingApprovals  = bookings.filter(b => b.bookingStatus === 'Pending').length

  // Occupancy: count booked nights this month vs total available nights
  const daysInMonth        = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const totalAvailableNights = daysInMonth * 2 // 2 houses

  const bookedNightsThisMonth = bookings
    .filter(b => b.bookingStatus === 'Confirmed')
    .reduce((sum, b) => {
      const cin  = new Date(b.checkIn)
      const cout = new Date(b.checkOut)
      if (cin.getFullYear() === now.getFullYear() && cin.getMonth() === now.getMonth()) {
        return sum + b.nights
      }
      return sum
    }, 0)

  const occupancyRate = Math.round((bookedNightsThisMonth / totalAvailableNights) * 100)

  return {
    bookingsThisMonth: thisMonth.length,
    revenueThisMonth,
    occupancyRate: Math.min(occupancyRate, 100),
    pendingApprovals,
  }
}
