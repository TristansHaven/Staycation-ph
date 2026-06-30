function PhotoTile({ url, label, height = 'h-28 sm:h-32' }: { url: string; label: string; height?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative`}>
      <img
        src={url}
        alt={label}
        className={`w-full ${height} object-cover group-hover:scale-105 transition-transform duration-300`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <div className="text-white text-xs font-medium drop-shadow">{label}</div>
      </div>
    </div>
  )
}

export default function Home() {
  const amenities = [
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782824444/swimming_Pool2_g9iegk.jpg', label: 'Swimming pool' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782823815/MiniRome_avskce.jpg', label: 'Mini Coliseum' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782823152/Leaning_Tower_zhehio.jpg', label: 'Leaning Tower replica' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782829977/Easter_Island_Statues_lxjs1e.jpg', label: 'Easter Island statues' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782823518/Giant_Chair_tx7tgd.jpg', label: 'Giant chair' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782823013/DRONE_SHOTS_-_Leaning_Tower_ebxqca.jpg', label: 'Camping ground' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782822951/DRONE_SHOTS_-_Front_Angle_uc0lbr.jpg', label: 'Hundreds of trees' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782822448/shooting_range_hamwte.jpg', label: 'Firing range' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782830080/Rabbits2_nzsxyt.jpg', label: 'Rabbits' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782829976/Duyan_d6tc9i.jpg', label: 'Hammock' },
  ]

  const rooms = [
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782748094/20260503_115538_iicyeu.jpg', label: 'House 1' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782822677/tree_trunk_lcugzc.jpg', label: 'Uniquely designed house' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782822339/sala_mrr4bn.jpg', label: 'Sala' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782830069/room1_dovjvo.jpg', label: 'Bedroom' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782830078/room2_giy6ad.jpg', label: 'Bedroom' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782824315/Loft_beds_vsme3c.jpg', label: 'Loft beds' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782823302/Loft_bed_2_vj1nao.jpg', label: 'Loft beds' },
  ]

  const dining = [
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782824130/dining2_qbzxqi.jpg', label: 'Dinner table' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782822450/dining_z21erb.jpg', label: 'Dining time' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782821934/Dining_from_Loft_gqhzl7.jpg', label: 'Dining table — top view' },
  ]

  const entrance = [
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782824143/DRONE_SHOTS_-_big_gate_bhk2rf.jpg', label: 'Main gate' },
    { url: 'https://res.cloudinary.com/diijtv8ls/image/upload/v1782823557/main_gate_ap9lzg.jpg', label: 'Main gate' },
  ]

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="relative text-cream py-24 px-4 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://res.cloudinary.com/diijtv8ls/image/upload/v1782823806/DRONE_SHOTS_-_webpage_no_gate_cqztby.jpg')" }}
        />
        <div className="absolute inset-0 bg-forest/70" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-sm text-cream/70 mb-3 tracking-widest uppercase">General Emilio Aguinaldo, Cavite</div>
          <h1 className="text-4xl sm:text-5xl font-display mb-1 drop-shadow-md">Staycation PH</h1>
          <p className="text-clay text-lg sm:text-3xl tracking-wide mb-4 drop-shadow-md">Tristan's Haven Leisure Farm</p>
          <p className="text-cream/90 text-lg mb-2 drop-shadow-sm">Your private estate escape</p>
          <p className="text-cream/70 text-sm mb-8">45 minutes from Tagaytay · 2 hours from Manila</p>
          <a href="/booking" className="inline-block bg-clay text-cream px-8 py-3 rounded-xl font-medium hover:bg-clay-dark transition-colors text-lg shadow-lg">
            Book your stay
          </a>
          <p className="text-cream/60 text-xs mt-4">House 1 available · Up to 16 guests · Full estate access</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-display text-forest text-center mb-2">What's included</h2>
        <p className="text-stone text-center text-sm mb-6">When you book, you get exclusive access to the entire 5,640 sqm property.</p>

        {/* Featured property photo */}
        <div className="rounded-2xl overflow-hidden mb-10 shadow-md">
          <img
            src="https://res.cloudinary.com/diijtv8ls/image/upload/v1782823071/DRONE_SHOTS_-_Top_Front_to_Kawayan_xqzq7w.jpg"
            alt="Aerial view of the 5,640 sqm estate"
            className="w-full h-56 sm:h-72 object-cover"
          />
        </div>

        {/* Amenities */}
        <h3 className="text-lg font-display text-forest mb-3">Amenities &amp; Activities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {amenities.map(g => <PhotoTile key={g.label + g.url} url={g.url} label={g.label} />)}
        </div>

        {/* Rooms */}
        <h3 className="text-lg font-display text-forest mb-3">The House &amp; Rooms</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {rooms.map(g => <PhotoTile key={g.label + g.url} url={g.url} label={g.label} height="h-32 sm:h-36" />)}
        </div>

        {/* Dining */}
        <h3 className="text-lg font-display text-forest mb-3">Dining</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {dining.map(g => <PhotoTile key={g.label + g.url} url={g.url} label={g.label} height="h-32 sm:h-40" />)}
        </div>

        {/* Entrance */}
        <h3 className="text-lg font-display text-forest mb-3">Entrance</h3>
        <div className="grid grid-cols-2 gap-3 mb-10">
          {entrance.map(g => <PhotoTile key={g.label + g.url} url={g.url} label={g.label} height="h-32 sm:h-40" />)}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="card max-w-sm mx-auto overflow-hidden p-0">
            <img
              src="https://res.cloudinary.com/diijtv8ls/image/upload/v1782748094/20260503_115538_iicyeu.jpg"
              alt="House 1"
              className="w-full h-40 object-cover"
            />
            <div className="p-6">
              <h3 className="font-display text-forest text-lg mb-1">House 1</h3>
              <p className="text-stone text-sm mb-3">Up to 16 guests · Private pool · Full estate</p>
              <div className="text-2xl font-display text-forest mb-4">₱15,000 <span className="text-sm font-body text-stone">/ night</span></div>
              <a href="/booking" className="btn-primary block text-center">Check availability</a>
            </div>
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
