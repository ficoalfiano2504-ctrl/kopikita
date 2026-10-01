import { useState } from 'react'

const adminPages = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Orders', path: '/admin/orders' },
  { label: 'Products', path: '/admin/products' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Customers', path: '/admin/customers' },
  { label: 'Payments', path: '/admin/payments' },
  { label: 'Settings', path: '/admin/settings' },
]

function AdminLayout({ pathname, onNavigate, onLogout, dataMode, error, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const activePage = adminPages.find((page) => page.path === pathname) || adminPages[0]

  const navigate = (path) => {
    setDrawerOpen(false)
    onNavigate(path)
  }

  return (
    <div className={`admin-layout${drawerOpen ? ' drawer-open' : ''}`}>
      <button
        type="button"
        className="admin-menu-toggle"
        aria-label={drawerOpen ? 'Close admin menu' : 'Open admin menu'}
        aria-expanded={drawerOpen}
        onClick={() => setDrawerOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      {drawerOpen && (
        <button
          type="button"
          className="admin-drawer-backdrop"
          aria-label="Close admin menu"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">K</span>
          <span>
            <strong>KopiKita</strong>
            <small>Admin</small>
          </span>
        </div>

        <nav className="admin-navigation" aria-label="Admin navigation">
          {adminPages.map((page) => (
            <button
              type="button"
              className={activePage.path === page.path ? 'active' : ''}
              aria-current={activePage.path === page.path ? 'page' : undefined}
              onClick={() => navigate(page.path)}
              key={page.path}
            >
              {page.label}
            </button>
          ))}
        </nav>

        <button type="button" className="admin-logout" onClick={onLogout}>
          Keluar Admin
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <span>KopiKita Admin</span>
            <h1>{activePage.label}</h1>
          </div>
          <div className="admin-header-actions">
            <nav className="admin-shortcuts" aria-label="Admin shortcuts">
              <button
                type="button"
                className={pathname === '/admin/orders' ? 'active' : ''}
                aria-current={pathname === '/admin/orders' ? 'page' : undefined}
                onClick={() => navigate('/admin/orders')}
              >
                Pesanan
              </button>
              <button
                type="button"
                className={pathname === '/admin/products' ? 'active' : ''}
                aria-current={pathname === '/admin/products' ? 'page' : undefined}
                onClick={() => navigate('/admin/products')}
              >
                Kelola Menu
              </button>
            </nav>
            <span className="admin-data-mode">{dataMode}</span>
          </div>
        </header>
        <main className="admin-content">
          {error && <p className="database-error" role="alert">{error}</p>}
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout