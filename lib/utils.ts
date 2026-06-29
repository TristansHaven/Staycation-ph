// lib/utils.ts — shared utility functions

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays } from 'date-fns'
import type { HouseChoice, PropertySettings } from '@/types'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as Philippine Peso */
export function formatPeso(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount)
}

/** Format a date string to readable format */
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d, yyyy')
}

/** Calculate number of nights between two date strings */
export function calcNights(checkIn: string, checkOut: string): number {
  return differenceInDays(new Date(checkOut), new Date(checkIn))
}

/** Calculate booking total, downpayment, and balance */
export function calcBookingAmounts(
  house: HouseChoice,
  nights: number,
  settings: PropertySettings
): { ratePerNight: number; subtotal: number; cleaningFee: number; total: number; downpayment: number; balance: number } {
  const rateMap: Record<HouseChoice, number> = {
    'House 1':     settings.house1Rate,
    'House 2':     settings.house2Rate,
    'Both Houses': settings.bothHousesRate,
  }
  const ratePerNight = rateMap[house]
  const subtotal     = ratePerNight * nights
  const cleaningFee  = settings.cleaningFee
  const total        = subtotal + cleaningFee
  const downpayment  = Math.ceil(total * (settings.downpaymentPercent / 100))
  const balance      = total - downpayment

  return { ratePerNight, subtotal, cleaningFee, total, downpayment, balance }
}

/** Get max guests allowed for a house */
export function getMaxGuests(house: HouseChoice, settings: PropertySettings): number {
  if (house === 'Both Houses') return settings.house1MaxGuests + settings.house2MaxGuests
  if (house === 'House 1')     return settings.house1MaxGuests
  return settings.house2MaxGuests
}

/** Validate Philippine phone number */
export function isValidPhoneNumber(phone: string): boolean {
  return /^(09|\+639)\d{9}$/.test(phone.replace(/[\s\-]/g, ''))
}

/** Truncate a string with ellipsis */
export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str
}
