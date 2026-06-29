'use client'

import { useEffect, useState } from 'react'
import type { Inquiry } from '@/types'

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState<Inquiry | null>(null)

  useEffect(() => {
    fetch('/api/inquiries')
      .then(r => r.json())
      .then(d => { if (d.success) setInquiries(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const STATUS_COLORS: Record<string, string> = {
    'New':           'bg-red-100 text-red-700',
    'AI Replied':    'bg-yellow-100 text-yellow-700',
    'Owner Replied': 'bg-green-100 text-green-700',
    'Closed':        'bg-gray-100 text-gray-500',
  }

  return (
    <div>
      <h1 className="text-2xl font-display text-forest mb-6">Inquiries</h1>

      {loading ? (
        <div className="text-center py-16 text-stone">Loading inquiries...</div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 text-stone/50">
          <div className="text-4xl mb-3">💬</div>
          <p>No inquiries yet</p>
          <p className="text-xs mt-2">Inquiries from the AI chat widget will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map(inq => (
            <div key={inq.id} onClick={() => setSelected(inq)}
              className="card hover:border-forest/30 cursor-pointer transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-stone-dark">{inq.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[inq.status]}`}>{inq.status}</span>
                  </div>
                  <p className="text-sm text-stone truncate">{inq.message}</p>
                  <div className="text-xs text-stone/60 mt-1">{inq.email} · {new Date(inq.timestamp).toLocaleDateString('en-PH')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-forest">Inquiry from {selected.name}</h2>
                <button onClick={() => setSelected(null)} className="text-stone text-xl">×</button>
              </div>
              <div className="space-y-3 text-sm">
                <div><span className="text-stone">Email: </span><span>{selected.email}</span></div>
                <div><span className="text-stone">Phone: </span><span>{selected.phone || '—'}</span></div>
                <div><span className="text-stone">Date: </span><span>{new Date(selected.timestamp).toLocaleString('en-PH')}</span></div>
                <div className="bg-cream rounded-xl p-3">
                  <div className="text-xs text-stone mb-1 font-medium">Message</div>
                  <p>{selected.message}</p>
                </div>
                {selected.aiReply && (
                  <div className="bg-forest/5 border border-forest/20 rounded-xl p-3">
                    <div className="text-xs text-forest mb-1 font-medium">AI reply sent</div>
                    <p>{selected.aiReply}</p>
                  </div>
                )}
                {selected.ownerReply && (
                  <div className="bg-leaf/10 border border-leaf/20 rounded-xl p-3">
                    <div className="text-xs text-forest mb-1 font-medium">Your reply</div>
                    <p>{selected.ownerReply}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
