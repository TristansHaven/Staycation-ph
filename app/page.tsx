export default function Home() {
  const amenities = [
    { icon: '🏊', label: 'Swimming pool' },
    { icon: '🏛️', label: 'Mini Coliseum' },
    { icon: '🗿', label: 'Easter Island statues' },
    { icon: '🍕', label: 'Leaning Tower replica' },
    { icon: '⛺', label: 'Camping ground' },
    { icon: '🌳', label: 'Hundreds of trees' },
    { icon: '🏡', label: 'Uniquely designed house' },
    { icon: '🔒', label: 'Exclusive full access' },
  ]

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="relative bg-forest text-cream py-20 px-4 text-center overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-sm text-cream/60 mb-3 tracking-widest uppercase">General Emilio Aguinaldo, Cavite</div>
          <h1 className="text-4xl sm:text-5xl font-display mb-1">Staycation PH</h1>
          <p className="text-clay text-lg sm:text-3xl tracking-wide mb-6">Tristan's Haven Leisure Farm</p>
          <p className="text-cream/80 text-lg mb-2">Your private estate escape</p>
          <p className="text-cream/60 text-sm mb-8">45 minutes from Tagaytay · 2 hours from Manila</p>
          <a href="/booking" className="inline-block bg-clay text-cream px-8 py-3 rounded-xl font-medium hover:bg-clay-dark transition-colors text-lg">
            Book your stay
          </a>
          <p className="text-cream/80 text-lg mb-2">House 1 available · Up to 16 guests · 5,640 sq. m. Full estate access</p>
        </div>
      </div>

      {/* Amenities */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-display text-forest text-center mb-2">What's included</h2>
        <p className="text-stone text-center text-sm mb-8">When you book, you get exclusive access to the entire 5,640 sqm property.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {amenities.map(a => (
            <div key={a.label} className="card text-center py-4 hover:border-forest/30 transition-all">
              <div className="text-3xl mb-2">{a.icon}</div>
              <div className="text-xs text-stone font-medium">{a.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="card max-w-sm mx-auto">
            <div className="text-3xl mb-3">🏡</div>
            <h3 className="font-display text-forest text-lg mb-1">House 1</h3>
            <p className="text-stone text-sm mb-3">Up to 16 guests · Private pool · Full estate</p>
            <div className="text-2xl font-display text-forest mb-4">₱15,000 <span className="text-sm font-body text-stone">/ night</span></div>
            <a href="/booking" className="btn-primary block text-center">Check availability</a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-stone/50 text-xs">
          <p>Questions? Message us on Facebook</p>
          <p className="mt-4">
            <a href="/auth/login" className="hover:text-forest transition-colors">Owner login</a>
          </p>
        </div>
      </div>
    </main>
  )
}
