import { useEffect, useMemo, useState } from 'react'
import './App.css'
import HomeSection from './components/HomeSection'
import ScrollSequenceBackground from './components/ScrollSequenceBackground'
import MenuSection from './components/MenuSection'
import OrderSection from './components/OrderSection'
import AdminSection from './components/AdminSection'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './components/AdminLogin'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import {
  createMenuItem,
  createOrder,
  deleteMenuItem,
  fetchMenu,
  fetchOrders,
  updateMenuItem,
  updateOrderStatus,
} from './lib/kopikitaData'

const baseDefaultMenu = [
  {
    id: 1,
    name: 'Caffè Latte',
    category: 'Coffee',
    price: 28000,
    description: 'Espresso lembut dengan susu creamy dan busa halus.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Espresso',
    category: 'Coffee',
    price: 22000,
    description: 'Kopi hitam pekat dengan aroma roasted nutty.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Caramel Macchiato',
    category: 'Signature',
    price: 32000,
    description: 'Espresso, susu, dan caramel yang manis seimbang.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    name: 'Matcha Cloud',
    category: 'Non Coffee',
    price: 30000,
    description: 'Matcha creamy dengan tekstur lembut dan rasa earthy.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    name: 'Toast Keju',
    category: 'Food',
    price: 26000,
    description: 'Roti panggang dengan keju meleleh dan sedikit herb.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    name: 'Nasi Goreng KopiKita',
    category: 'Food',
    price: 42000,
    description: 'Nasi goreng spesial dengan rasa gurih dan porsi hangat.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
  },
]

const additionalDefaultMenu = [
  {
    id: 7,
    name: 'Americano',
    category: 'Coffee',
    price: 24000,
    description: 'Espresso dengan air panas, ringan dengan karakter roasted yang bersih.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 8,
    name: 'Cappuccino',
    category: 'Coffee',
    price: 28000,
    description: 'Espresso seimbang dengan steamed milk dan foam yang lembut.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 9,
    name: 'Flat White',
    category: 'Coffee',
    price: 30000,
    description: 'Double espresso dengan microfoam halus dan rasa kopi yang lebih bold.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 10,
    name: 'Kopi Aren Latte',
    category: 'Signature',
    price: 28000,
    description: 'Espresso dan susu segar dengan manis alami gula aren.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 11,
    name: 'Sea Salt Caramel Latte',
    category: 'Signature',
    price: 34000,
    description: 'Latte lembut dengan caramel dan sentuhan sea salt.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 12,
    name: 'Chocolate Hazelnut',
    category: 'Non Coffee',
    price: 32000,
    description: 'Cokelat pekat dengan susu creamy dan aroma hazelnut.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 13,
    name: 'Chicken Sandwich',
    category: 'Food',
    price: 38000,
    description: 'Roti panggang dengan ayam, sayuran segar, dan saus house-made.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 14,
    name: 'Butter Croissant',
    category: 'Food',
    price: 22000,
    description: 'Croissant berlapis dengan aroma butter dan tekstur renyah.',
    available: true,
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
  },
]

const defaultMenu = [...baseDefaultMenu, ...additionalDefaultMenu]
const MENU_SEED_VERSION = '3'

const defaultOrders = [
  {
    id: 1001,
    customerName: 'Rina',
    tableNumber: 'A2',
    status: 'Baru',
    notes: 'Pedas sedang, tanpa bawang.',
    items: [
      { id: 1, name: 'Caffè Latte', qty: 1, price: 28000 },
      { id: 5, name: 'Toast Keju', qty: 1, price: 26000 },
    ],
    createdAt: '2026-09-23T09:10:00',
  },
  {
    id: 1002,
    customerName: 'Dimas',
    tableNumber: 'B5',
    status: 'Diterima',
    notes: 'Tambah es batu.',
    items: [{ id: 3, name: 'Caramel Macchiato', qty: 2, price: 32000 }],
    createdAt: '2026-09-23T09:25:00',
  },
]

const STATUS_FLOW = ['Baru', 'Diterima', 'Diproses', 'Siap', 'Selesai']

const formatMoney = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

function App() {
  const [menu, setMenu] = useState(() => {
    const savedMenu = localStorage.getItem('kopikita-menu')
    if (!savedMenu) return defaultMenu

    const parsedMenu = JSON.parse(savedMenu)
    if (localStorage.getItem('kopikita-menu-seed-version') === MENU_SEED_VERSION) {
      return parsedMenu
    }

    const savedIds = new Set(parsedMenu.map((item) => item.id))
    const missingMenuItems = additionalDefaultMenu.filter((item) => !savedIds.has(item.id))
    const updatedMenu = parsedMenu.map((item) => (
      item.id === 13
        ? { ...item, image: additionalDefaultMenu.find((defaultItem) => defaultItem.id === 13).image }
        : item
    ))
    return [...updatedMenu, ...missingMenuItems]
  })
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('kopikita-orders')
    return savedOrders ? JSON.parse(savedOrders) : defaultOrders
  })
  const [cart, setCart] = useState([])
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.replace(/\/+$/, '') || '/')
  const [authSession, setAuthSession] = useState(null)
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [menuReady, setMenuReady] = useState(!isSupabaseConfigured)
  const [ordersReady, setOrdersReady] = useState(!isSupabaseConfigured)
  const [databaseError, setDatabaseError] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginPending, setLoginPending] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('A1')
  const [notes, setNotes] = useState('')
  const [menuForm, setMenuForm] = useState({
    id: null,
    name: '',
    category: 'Coffee',
    price: '',
    description: '',
    available: true,
  })

  const isAdminRoute = currentPath === '/admin' || currentPath.startsWith('/admin/')
  const isAdminUser = authSession?.user?.app_metadata?.role === 'admin'
  const customerSection = currentPath === '/menu'
    ? 'menu'
    : currentPath === '/order' || currentPath === '/checkout'
      ? 'order'
      : 'home'

  const navigateTo = (path) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  const navigateFromNavbar = (path) => {
    navigateTo(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateCustomer = (section) => {
    const routes = { home: '/', menu: '/menu', order: '/order' }
    navigateTo(routes[section] || '/')
  }

  useEffect(() => {
    const syncPath = () => setCurrentPath(window.location.pathname.replace(/\/+$/, '') || '/')
    window.addEventListener('popstate', syncPath)
    return () => window.removeEventListener('popstate', syncPath)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let active = true
    const loadMenu = async () => {
      try {
        const storedMenu = await fetchMenu()
        if (active) {
          setMenu(storedMenu)
          setDatabaseError('')
        }
      } catch (error) {
        if (active) setDatabaseError(`Menu Supabase gagal dimuat: ${error.message}`)
      } finally {
        if (active) setMenuReady(true)
      }
    }

    loadMenu()
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setDatabaseError(`Sesi admin gagal dimuat: ${error.message}`)
      setAuthSession(data.session)
      if (data.session?.user?.app_metadata?.role === 'admin') {
        setOrdersReady(false)
      } else {
        setOrders([])
        setOrdersReady(true)
      }
      setAuthReady(true)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session)
      if (session?.user?.app_metadata?.role === 'admin') {
        setOrdersReady(false)
      } else {
        setOrders([])
        setOrdersReady(true)
      }
      setAuthReady(true)
      setLoginError('')
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !isAdminUser) return

    let active = true
    fetchOrders()
      .then((storedOrders) => {
        if (active) {
          setOrders(storedOrders)
          setDatabaseError('')
        }
      })
      .catch((error) => {
        if (active) setDatabaseError(`Order Supabase gagal dimuat: ${error.message}`)
      })
      .finally(() => {
        if (active) setOrdersReady(true)
      })

    return () => {
      active = false
    }
  }, [isAdminUser])

  useEffect(() => {
    if (isSupabaseConfigured) return
    localStorage.setItem('kopikita-menu', JSON.stringify(menu))
    localStorage.setItem('kopikita-menu-seed-version', MENU_SEED_VERSION)
  }, [menu])

  useEffect(() => {
    if (isSupabaseConfigured) return
    localStorage.setItem('kopikita-orders', JSON.stringify(orders))
  }, [orders])

  const totalCart = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.qty, 0),
    [cart],
  )

  const addToCart = (item) => {
    setCart((current) => {
      const existingItem = current.find((entry) => entry.id === item.id)
      if (existingItem) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry,
        )
      }

      return [...current, { ...item, qty: 1 }]
    })
  }

  const updateCartQty = (id, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item,
        )
        .filter((item) => item.qty > 0),
    )
  }

  const handlePlaceOrder = async (event) => {
    event.preventDefault()

    if (!cart.length) {
      return
    }

    const nextOrder = {
      id: Date.now(),
      customerName: customerName || 'Customer',
      tableNumber,
      notes: notes || 'Tidak ada catatan khusus.',
      status: 'Baru',
      createdAt: new Date().toISOString(),
      items: cart.map(({ id, name, qty, price }) => ({ id, name, qty, price })),
    }

    if (isSupabaseConfigured) {
      try {
        await createOrder(nextOrder)
        setDatabaseError('')
      } catch (error) {
        window.alert(`Pesanan gagal disimpan: ${error.message}`)
        return
      }
    }

    if (!isSupabaseConfigured) {
      setOrders((current) => [nextOrder, ...current])
    }
    setCart([])
    setCustomerName('')
    setNotes('')
    navigateTo('/')
  }

  const handleStatusChange = async (orderId, direction) => {
    const order = orders.find((entry) => entry.id === orderId)
    if (!order) return

    const currentIndex = STATUS_FLOW.indexOf(order.status)
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    const safeIndex = Math.min(STATUS_FLOW.length - 1, Math.max(0, nextIndex))
    const nextStatus = STATUS_FLOW[safeIndex]

    if (isSupabaseConfigured) {
      try {
        await updateOrderStatus(orderId, nextStatus)
        setDatabaseError('')
      } catch (error) {
        window.alert(`Status pesanan gagal diperbarui: ${error.message}`)
        return
      }
    }

    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) {
          return order
        }
        return { ...order, status: nextStatus }
      }),
    )
  }

  const handleMenuSubmit = async (event) => {
    event.preventDefault()

    if (!menuForm.name || !menuForm.price) {
      return
    }

    const payload = {
      ...menuForm,
      price: Number(menuForm.price),
      id: menuForm.id ?? Date.now(),
    }

    if (isSupabaseConfigured) {
      try {
        const savedItem = menuForm.id
          ? await updateMenuItem(payload)
          : await createMenuItem(payload)
        setMenu((current) => menuForm.id
          ? current.map((item) => (item.id === savedItem.id ? savedItem : item))
          : [savedItem, ...current])
        setDatabaseError('')
      } catch (error) {
        window.alert(`Menu gagal disimpan: ${error.message}`)
        return
      }
    } else if (menuForm.id) {
      setMenu((current) => current.map((item) => (item.id === menuForm.id ? payload : item)))
    } else {
      setMenu((current) => [payload, ...current])
    }

    setMenuForm({
      id: null,
      name: '',
      category: 'Coffee',
      price: '',
      description: '',
      available: true,
    })
  }

  const handleMenuEdit = (item) => {
    setMenuForm({ ...item, price: String(item.price) })
  }

  const handleMenuDelete = async (id) => {
    if (isSupabaseConfigured) {
      try {
        await deleteMenuItem(id)
        setDatabaseError('')
      } catch (error) {
        window.alert(`Menu gagal dihapus: ${error.message}`)
        return
      }
    }
    setMenu((current) => current.filter((item) => item.id !== id))
  }

  const handleAdminLogin = async (event, email, password) => {
    event.preventDefault()
    setLoginPending(true)
    setLoginError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoginError(error.message)
    } else if (data.user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      setLoginError('Akun ini belum memiliki akses admin.')
    }

    setLoginPending(false)
  }

  const handleAdminLogout = async () => {
    await supabase.auth.signOut()
    navigateTo('/')
  }

  if (isAdminRoute) {
    if (isSupabaseConfigured && !authReady) {
      return <div className="admin-auth-loading">Memeriksa sesi admin...</div>
    }

    if (isSupabaseConfigured && !isAdminUser) {
      return (
        <AdminLogin
          onSubmit={handleAdminLogin}
          error={loginError}
          pending={loginPending}
        />
      )
    }

    if (isSupabaseConfigured && (!menuReady || !ordersReady)) {
      return <div className="admin-auth-loading">Memuat data Supabase...</div>
    }

    return (
      <AdminLayout
        pathname={currentPath}
        onNavigate={navigateTo}
        onLogout={isSupabaseConfigured ? handleAdminLogout : () => navigateTo('/')}
        dataMode={isSupabaseConfigured ? 'Supabase' : 'Local demo data'}
        error={databaseError}
      >
        <AdminSection
          pathname={currentPath}
          orders={orders}
          menu={menu}
          menuForm={menuForm}
          setMenuForm={setMenuForm}
          onStatusChange={handleStatusChange}
          onMenuSubmit={handleMenuSubmit}
          onMenuEdit={handleMenuEdit}
          onMenuDelete={handleMenuDelete}
          formatMoney={formatMoney}
          dataMode={isSupabaseConfigured ? 'Supabase' : 'Local demo data'}
        />
      </AdminLayout>
    )
  }

  return (
    <div className="page-shell">
      {currentPath === '/' && <ScrollSequenceBackground />}
      <header className="topbar">
        <div className="brand-wrap">
          <img className="brand-mark" src="/logo.png" alt="" />
          <div>
            <p className="brand-name">KopiKita</p>
            <span className="brand-tag">Coffee & Kitchen</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <button
            type="button"
            className={customerSection === 'home' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => navigateFromNavbar('/')}
          >
            Home
          </button>
          <button
            type="button"
            className={customerSection === 'menu' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => navigateFromNavbar('/menu')}
          >
            Menu
          </button>
          <button
            type="button"
            className={customerSection === 'order' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => navigateFromNavbar('/order')}
          >
            Order
          </button>
        </nav>

        <button type="button" className="primary-btn" onClick={() => navigateTo('/order')}>
          Pesan Sekarang
        </button>
      </header>

      <main className="content-area">
        {databaseError && <p className="database-error" role="alert">{databaseError}</p>}
        {customerSection === 'home' && <HomeSection onNavigate={navigateCustomer} />}

        {customerSection === 'menu' && (
          <MenuSection
            menu={menu}
            onAddToCart={addToCart}
            onGoToOrder={() => navigateTo('/checkout')}
          />
        )}

        {customerSection === 'order' && (
          <OrderSection
            cart={cart}
            customerName={customerName}
            tableNumber={tableNumber}
            notes={notes}
            totalCart={totalCart}
            onCustomerNameChange={setCustomerName}
            onTableNumberChange={setTableNumber}
            onNotesChange={setNotes}
            onAddQty={(id) => updateCartQty(id, 1)}
            onReduceQty={(id) => updateCartQty(id, -1)}
            onPlaceOrder={handlePlaceOrder}
            formatMoney={formatMoney}
          />
        )}

      </main>
    </div>
  )
}

export default App
