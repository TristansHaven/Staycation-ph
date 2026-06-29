export default function AdsPage() {
  const posts = [
    { day: 'Mon', type: 'Facebook Reel', idea: 'Pool + mini Colosseum tour video — "We have ancient Rome in Cavite 🏛️"' },
    { day: 'Wed', type: 'Photo post',    idea: 'Aerial view of the 5,640 sqm estate — emphasize privacy and space' },
    { day: 'Fri', type: 'TikTok / Reel', idea: 'Easter Island statues reveal — "Guess where this is in the Philippines 🗿"' },
  ]

  const tips = [
    { icon: '🎯', title: 'Target audience', desc: 'Metro Manila residents, ages 22–45, interested in travel, staycations, family activities. 2-hour drive radius.' },
    { icon: '💰', title: 'Ad budget', desc: 'Start with ₱200–300/day on Facebook. Boost your best-performing Reel first. Scale up when you see bookings.' },
    { icon: '📸', title: 'Best content', desc: 'Videos of the mini landmarks, pool, and wide estate shots perform best. Unique = shareable.' },
    { icon: '⏰', title: 'Best time to post', desc: 'Thursday–Sunday evenings (7–9pm). People plan weekend getaways at this time.' },
    { icon: '🏷️', title: 'Hashtags to use', desc: '#CaviteStaycation #TagaytayNearby #PrivatePool #StaycationPH #FamilyGetaway #CaviteHidden' },
    { icon: '📍', title: 'Location advantage', desc: 'Position as "the hidden gem near Tagaytay" — less known = less competition, more curiosity.' },
  ]

  const platforms = [
    { name: 'Facebook Ads Manager', url: 'https://facebook.com/adsmanager', icon: '📘', desc: 'Boost posts and run targeted ads' },
    { name: 'Canva',                url: 'https://canva.com',               icon: '🎨', desc: 'Design rate cards and promo graphics' },
    { name: 'TikTok Studio',        url: 'https://studio.tiktok.com',       icon: '🎵', desc: 'Post and track your TikTok videos' },
    { name: 'Meta Business Suite',  url: 'https://business.facebook.com',   icon: '💼', desc: 'Manage Facebook + Instagram together' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-display text-forest mb-2">Marketing</h1>
      <p className="text-stone text-sm mb-6">Content ideas and tools to attract guests from Manila and Tagaytay.</p>

      {/* Weekly content plan */}
      <div className="card mb-6">
        <h2 className="font-display text-forest mb-4">📅 This week's content plan</h2>
        <div className="space-y-3">
          {posts.map((p, i) => (
            <div key={i} className="flex gap-4 p-3 bg-cream rounded-xl">
              <div className="w-10 h-10 bg-forest text-cream rounded-xl flex items-center justify-center text-xs font-medium flex-shrink-0">
                {p.day}
              </div>
              <div>
                <div className="text-xs text-clay font-medium mb-0.5">{p.type}</div>
                <div className="text-sm text-stone-dark">{p.idea}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="card mb-6">
        <h2 className="font-display text-forest mb-4">💡 Marketing tips for your property</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((t, i) => (
            <div key={i} className="p-3 bg-cream rounded-xl">
              <div className="text-xl mb-1">{t.icon}</div>
              <div className="font-medium text-sm text-stone-dark mb-1">{t.title}</div>
              <div className="text-xs text-stone leading-relaxed">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform links */}
      <div className="card">
        <h2 className="font-display text-forest mb-4">🔗 Quick links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {platforms.map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-cream rounded-xl hover:bg-cream-dark transition-colors group">
              <div className="text-2xl">{p.icon}</div>
              <div>
                <div className="font-medium text-sm text-stone-dark group-hover:text-forest transition-colors">{p.name} ↗</div>
                <div className="text-xs text-stone">{p.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
