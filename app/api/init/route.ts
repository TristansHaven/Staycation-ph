// app/api/init/route.ts
// One-time setup endpoint — initialises all Google Sheets tabs and headers.
// Call this once after deployment: GET /api/init
// Protect in production by removing or adding auth.

import { NextResponse } from 'next/server'
import { initializeSheets } from '@/lib/sheets'

export async function GET() {
  try {
    await initializeSheets()
    return NextResponse.json({
      success: true,
      message: 'Google Sheets initialized successfully. All tabs and headers are ready.',
    })
  } catch (error) {
    console.error('Sheet init error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
