import { useState } from 'react'

const fallbackMenuImage = 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=900&q=80'

function MenuSection({ menu, onAddToCart, onGoToOrder }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = [...new Set(menu.map((item) => item.category).filter(Boolean))].sort((left, right) => {
    const preferredOrder = ['Coffee', 'Signature', 'Food', 'Pastry']
    const leftOrder = preferredOrder.indexOf(left)
    const rightOrder = preferredOrder.indexOf(right)
    return (leftOrder === -1 ? preferredOrder.length : leftOrder) - (rightOrder === -1 ? preferredOrder.length : rightOrder)
  })
  const featuredItem = menu.find((item) => item.category === 'Signature')
  const showFeatured = featuredItem && (activeCategory === 'All' || activeCategory === 'Signature')
  const visibleItems = menu.filter((item) => (
    (activeCategory === 'All' || item.category === activeCategory) && item.id !== featuredItem?.id
  ))
  const visibleCategories = activeCategory === 'All'
    ? categories
    : categories.filter((category) => category === activeCategory)

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)

  return (
    <section className="menu-section">
      <div className="menu-intro">
        <div className="menu-intro-copy">
          <span className="menu-kicker">Our menu</span>
          <h1>Crafted for your moment.</h1>
          <p>Coffee, food, and treats made with care.</p>
        </div>
        <button type="button" className="primary-btn menu-checkout-btn" onClick={onGoToOrder}>
          Ke Check Out
        </button>
      </div>

      <nav className="menu-category-nav" aria-label="Menu categories">
        {['All', ...categories].map((category) => (
          <button
            type="button"
            className={activeCategory === category ? 'active' : ''}
            aria-pressed={activeCategory === category}
            onClick={() => setActiveCategory(category)}
            key={category}
          >
            {category}
          </button>
        ))}
      </nav>

      {showFeatured && (
        <article className="menu-featured">
          <div
            className="menu-featured-image"
            style={{ backgroundImage: `url(${featuredItem.image || 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=1200&q=85'})` }}
            role="img"
            aria-label={featuredItem.name}
          />
          <div className="menu-featured-copy">
            <span className="menu-featured-label">Signature</span>
            {!featuredItem.available && <span className="menu-sold-out">Sold out</span>}
            <h2>{featuredItem.name}</h2>
            <p>{featuredItem.description}</p>
            <div className="menu-featured-action">
              <strong>{formatPrice(featuredItem.price)}</strong>
              <button
                type="button"
                onClick={() => onAddToCart(featuredItem)}
                disabled={!featuredItem.available}
              >
                Add to order <span aria-hidden="true">+</span>
              </button>
            </div>
          </div>
        </article>
      )}

      <div className="menu-category-list">
        {visibleCategories.map((category) => {
          const items = visibleItems.filter((item) => item.category === category)
          if (!items.length) return null

          return (
            <section className="menu-category-section" key={category}>
              <div className="menu-category-heading">
                <h2>{category}</h2>
                <span>{String(items.length).padStart(2, '0')} items</span>
              </div>
              <div className="menu-item-list">
                {items.map((item) => {
                  return (
                    <article className="menu-item-row has-thumbnail" key={item.id}>
                      <div
                        className="menu-item-thumbnail"
                        style={{ backgroundImage: `url(${item.image || fallbackMenuImage})` }}
                        role="img"
                        aria-label={item.name}
                      />
                      <div className="menu-item-copy">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        {!item.available && <span className="menu-sold-out">Sold out</span>}
                      </div>
                      <strong className="menu-item-price">{formatPrice(item.price)}</strong>
                      <button
                        type="button"
                        className="menu-add-button"
                        aria-label={`Add ${item.name} to order`}
                        onClick={() => onAddToCart(item)}
                        disabled={!item.available}
                      >
                        +
                      </button>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
        {!menu.length && <p className="menu-empty-state">Our menu is being prepared.</p>}
      </div>
    </section>
  )
}

export default MenuSection
