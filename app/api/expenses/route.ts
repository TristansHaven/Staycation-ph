import { NextRequest, NextResponse } from 'next/server'
import { getAllExpenses, createExpense } from '@/lib/sheets'
import { format } from 'date-fns'

export async function GET() {
  try {
    const expenses = await getAllExpenses()
    return NextResponse.json({ success: true, data: expenses })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body    = await req.json()
    const expense = await createExpense({
      date:        body.date || format(new Date(), 'yyyy-MM-dd'),
      category:    body.category || 'Other',
      description: body.description,
      amount:      Number(body.amount),
      paidBy:      body.paidBy,
      receiptRef:  body.receiptRef || '',
    })
    return NextResponse.json({ success: true, data: expense })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
