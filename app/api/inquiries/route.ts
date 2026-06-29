import { NextResponse } from 'next/server'
import { getAllInquiries } from '@/lib/sheets'

export async function GET() {
  try {
    const inquiries = await getAllInquiries()
    return NextResponse.json({ success: true, data: inquiries })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
