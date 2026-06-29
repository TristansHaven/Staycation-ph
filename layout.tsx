import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: `${process.env.PROPERTY_NAME || 'Staycation PH'} — Private Estate in Cavite`,
  description: 'Your private estate escape, 45 minutes from Tagaytay. Pool, mini landmarks, camping, and 5,640 sqm of privacy.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cream font-body text-stone-dark antialiased">
        {children}
      </body>
    </html>
  )
}
