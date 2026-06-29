// ============================================================
// STAYCATION PH — Shared TypeScript Types
// ============================================================

// ─── Booking ─────────────────────────────────────────────
export type BookingStatus = 'Pending' | 'Confirmed' | 'Declined' | 'Cancelled'
export type PaymentStatus = 'Unpaid' | 'Downpayment Received' | 'Fully Paid'
export type PaymentMethod = 'GCash' | 'Bank Transfer' | 'PayMongo' | 'Pay on Arrival'
export type HouseChoice  = 'House 1' | 'House 2' | 'Both Houses'

export interface Booking {
  id:               string          // BK-YYYYMMDD-XXXX
  dateSubmitted:    string          // ISO date string
  guestName:        string
  email:            string
  phone:            string
  house:            HouseChoice
  checkIn:          string          // YYYY-MM-DD
  checkOut:         string          // YYYY-MM-DD
  nights:           number
  guests:           number
  totalAmount:      number          // PHP
  downpayment:      number          // PHP
  balance:          number          // PHP
  paymentMethod:    PaymentMethod
  paymentStatus:    PaymentStatus
  bookingStatus:    BookingStatus
  specialRequests?: string
  notes?:           string          // owner-only internal notes
  calendarEventId?: string          // Google Calendar event ID for blocking
}

// ─── Inquiry / Chat ──────────────────────────────────────
export type InquiryStatus = 'New' | 'AI Replied' | 'Owner Replied' | 'Closed'

export interface Inquiry {
  id:          string
  timestamp:   string
  name:        string
  email:       string
  phone?:      string
  message:     string
  aiReply?:    string
  ownerReply?: string
  status:      InquiryStatus
}

// ─── Expense ─────────────────────────────────────────────
export type ExpenseCategory =
  | 'Cleaning'
  | 'Maintenance'
  | 'Supplies'
  | 'Utilities'
  | 'Salaries'
  | 'Marketing'
  | 'Other'

export interface Expense {
  id:          string
  date:        string          // YYYY-MM-DD
  category:    ExpenseCategory
  description: string
  amount:      number          // PHP
  paidBy:      string
  receiptRef?: string
}

// ─── Chat ────────────────────────────────────────────────
export interface ChatMessage {
  role:    'user' | 'assistant'
  content: string
}

// ─── Property Settings ───────────────────────────────────
export interface PropertySettings {
  house1Rate:          number
  house2Rate:          number
  bothHousesRate:      number
  cleaningFee:         number
  downpaymentPercent:  number
  house1MaxGuests:     number
  house2MaxGuests:     number
  checkinTime:         string   // e.g. "14:00"
  checkoutTime:        string   // e.g. "11:00"
  minNights:           number
}

// ─── Availability ────────────────────────────────────────
export interface AvailabilityResult {
  available:    boolean
  bookedRanges: { start: string; end: string }[]
}

// ─── Dashboard Stats ─────────────────────────────────────
export interface DashboardStats {
  bookingsThisMonth:  number
  revenueThisMonth:   number
  occupancyRate:      number   // 0–100 percentage
  pendingApprovals:   number
}

// ─── API Response wrapper ────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?:   T
  error?:  string
}
