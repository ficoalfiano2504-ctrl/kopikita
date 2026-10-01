import React, { useEffect } from 'react'

const googleMapsUrl = 'https://maps.app.goo.gl/Rja9r3LcMZU6VeRE7'
const googleMapsEmbedUrl = 'https://maps.google.com/maps?q=-5.377189,105.3124647&z=16&output=embed'

const favoriteItems = [
  {
    name: 'Caramel Latte',
    description: 'Espresso lembut dengan susu creamy dan caramel yang manis.',
    price: 22000,
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Kopi Susu Gula Aren',
    description: 'Kopi susu dengan rasa gula aren yang hangat dan lembut.',
    price: 18000,
    image:
      'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Matcha Latte',
    description: 'Matcha lembut dengan tekstur creamy yang memanjakan.',
    price: 24000,
    image:
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Chocolate Cream',
    description: 'Minuman cokelat hangat dengan tekstur krim yang lembut.',
    price: 23000,
    image:
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80',
  },
]

const benefits = [
  'Biji kopi pilihan',
  'Suasana nyaman',
  'Wi-Fi tersedia',
  'Colokan tersedia',
  'Area parkir',
  'Bisa delivery',
]

const galleryItems = [
  {
    className: 'gallery-large',
    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
  },
  {
    className: 'gallery-tall',
    image:
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80',
  },
  {
    className: 'gallery-medium',
    image:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80',
  },
  {
    className: 'gallery-small',
    image:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80',
  },
]

const testimonials = [
  {
    name: 'Rizky',
    quote: 'Kopinya enak dan tempatnya nyaman banget buat nugas.',
  },
  {
    name: 'Aulia',
    quote: 'Pelayanannya cepat, suasananya juga nyaman.',
  },
  {
    name: 'Dimas',
    quote: 'Tempat favorit buat ngopi sore.',
  },
]

function HomeSection({ onNavigate }) {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-once')

    if (!elements.length) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px',
      },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className="home-page-content">
        <section className="hero-section">
          <div className="hero-copy">
            <h1 className="hero-animate hero-animate-delay-2">
              Secangkir kopi,<br />
              untuk hari yang<br />
              lebih hangat.
            </h1>
            <p className="hero-animate hero-animate-delay-3">
              Nikmati espresso, menu makanan hangat, dan pengalaman santai di KopiKita,
              tempat terbaik untuk meeting, kerja, atau sekadar recharge.
            </p>
            <div className="hero-actions hero-animate hero-animate-delay-4">
              <button type="button" className="primary-btn" onClick={() => onNavigate('menu')}>
                Lihat Menu
              </button>
              <button type="button" className="secondary-btn" onClick={() => onNavigate('order')}>
                Pesan Sekarang →
              </button>
            </div>
            <div className="hero-meta hero-animate hero-animate-delay-5">
              <div>
                <strong>4.9/5</strong>
                <span>Review pelanggan</span>
              </div>
              <div>
                <strong>12 min</strong>
                <span>Waktu antar</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Open order</span>
              </div>
            </div>
          </div>
        </section>

      <section className="section-shell favorite-section">
        <div className="section-header reveal-once" style={{ '--delay': '80ms' }}>
          <h2>Favorit Minggu Ini</h2>
        </div>
        <p className="section-subtitle reveal-once" style={{ '--delay': '120ms' }}>
          Menu yang paling sering dipesan pelanggan KopiKita.
        </p>

        <div className="favorite-grid">
          {favoriteItems.map((item, index) => (
            <article
              className="product-card reveal-once"
              key={item.name}
              style={{ '--delay': `${index * 110 + 160}ms` }}
            >
              <div
                className="product-image"
                style={{ backgroundImage: `url(${item.image})` }}
                aria-label={item.name}
              />
              <div className="product-body">
                <span className="mini-tag">Best Seller</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="product-footer">
                  <strong>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    }).format(item.price)}
                  </strong>
                  <button
                    type="button"
                    className="primary-btn small"
                    onClick={() => onNavigate('order')}
                  >
                    Pesan
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell about-section reveal-once">
        <div className="about-visual reveal-once" style={{ '--delay': '80ms' }}>
          <div className="about-image" />
        </div>
        <div className="about-copy reveal-once" style={{ '--delay': '140ms' }}>
          <span className="eyebrow">Kenapa KopiKita?</span>
          <h2>Tempat yang pas untuk ngopi, kerja, dan ngobrol.</h2>
          <ul className="benefit-list">
            {benefits.map((benefit, index) => (
              <li key={benefit} className="reveal-once" style={{ '--delay': `${index * 90 + 180}ms` }}>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-shell gallery-section reveal-once">
        <div className="section-header center-header reveal-once" style={{ '--delay': '80ms' }}>
          <h2>Suasana KopiKita</h2>
        </div>
        <p className="section-subtitle center-subtitle reveal-once" style={{ '--delay': '120ms' }}>
          Tempat sederhana untuk menikmati kopi dan menghabiskan waktu.
        </p>

        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <div
              key={`${item.className}-${index}`}
              className={`gallery-item ${item.className} reveal-once`}
              style={{ '--delay': `${index * 100 + 160}ms` }}
            >
              <div className="gallery-image" style={{ backgroundImage: `url(${item.image})` }} />
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell testimonial-section reveal-once">
        <div className="section-header center-header reveal-once" style={{ '--delay': '80ms' }}>
          <h2>Apa Kata Mereka?</h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((item, index) => (
            <article
              className="testimonial-card reveal-once"
              key={item.name}
              style={{ '--delay': `${index * 120 + 160}ms` }}
            >
              <div className="stars">★★★★★</div>
              <p>“{item.quote}”</p>
              <strong>— {item.name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell location-section reveal-once">
        <div className="location-copy reveal-once" style={{ '--delay': '80ms' }}>
          <span className="eyebrow">Temui kami</span>
          <h2>Temui Kami</h2>
          <div className="location-list">
            <p>📍 Bandar Lampung</p>
            <p>🕐 Senin–Minggu: 08.00–22.00</p>
            <p>📞 08xx-xxxx-xxxx</p>
          </div>
          <button type="button" className="primary-btn" onClick={() => window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')}>
            Lihat di Google Maps
          </button>
        </div>

        <div className="map-card reveal-once" style={{ '--delay': '160ms' }}>
          <iframe
            className="location-map-frame"
            src={googleMapsEmbedUrl}
            title="Google Maps: SMK Negeri 7 Bandar Lampung"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="section-shell cta-section reveal-once">
        <div className="cta-panel reveal-once" style={{ '--delay': '100ms' }}>
          <div>
            <span className="eyebrow">Ayo pesan</span>
            <h2>Sudah tahu mau pesan apa?</h2>
          </div>
          <p>
            Temukan kopi favoritmu dan nikmati hari yang lebih hangat bersama KopiKita.
          </p>
          <div className="cta-actions">
            <button type="button" className="primary-btn" onClick={() => onNavigate('menu')}>
              Lihat Menu
            </button>
            <button type="button" className="secondary-btn" onClick={() => onNavigate('order')}>
              Pesan Sekarang
            </button>
          </div>
        </div>
      </section>

      <footer className="site-footer reveal-once" style={{ '--delay': '120ms' }}>
        <p>© 2026 KopiKita. Coffee & Kitchen.</p>
      </footer>
      </div>
    </>
  )
}

export default HomeSection
