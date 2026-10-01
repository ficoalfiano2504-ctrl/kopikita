function AdminSection({
  pathname,
  orders,
  menu,
  menuForm,
  setMenuForm,
  onStatusChange,
  onMenuSubmit,
  onMenuEdit,
  onMenuDelete,
  formatMoney,
  dataMode,
}) {
  const route = pathname === '/admin' ? 'dashboard' : pathname.slice('/admin/'.length)
  const orderTotal = (order) => order.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const revenue = orders.reduce((sum, order) => sum + orderTotal(order), 0)
  const categories = [...new Set(menu.map((item) => item.category).filter(Boolean))].sort()
  const customerMap = new Map()

  orders.forEach((order) => {
    const customer = customerMap.get(order.customerName) || {
      name: order.customerName,
      orderCount: 0,
      totalSpent: 0,
      latestOrder: order.createdAt,
    }
    customer.orderCount += 1
    customer.totalSpent += orderTotal(order)
    if (new Date(order.createdAt) > new Date(customer.latestOrder)) customer.latestOrder = order.createdAt
    customerMap.set(order.customerName, customer)
  })

  const customers = [...customerMap.values()]
  const formatDate = (value) => new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const renderOrdersTable = (rows, allowStatusActions = false) => (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Meja</th>
            <th>Waktu</th>
            <th>Total</th>
            <th>Status</th>
            {allowStatusActions && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.customerName}</td>
              <td>{order.tableNumber}</td>
              <td>{formatDate(order.createdAt)}</td>
              <td>{formatMoney(orderTotal(order))}</td>
              <td><span className="admin-status">{order.status}</span></td>
              {allowStatusActions && (
                <td>
                  <div className="admin-row-actions">
                    <button type="button" onClick={() => onStatusChange(order.id, 'prev')}>Sebelumnya</button>
                    <button type="button" onClick={() => onStatusChange(order.id, 'next')}>Lanjutkan</button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {!rows.length && (
            <tr><td className="admin-empty-cell" colSpan={allowStatusActions ? 7 : 6}>Belum ada order.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )

  if (route === 'dashboard') {
    const metrics = [
      { label: 'Total Orders', value: orders.length },
      { label: 'Total Products', value: menu.length },
      { label: 'Total Customers', value: customers.length },
      { label: 'Revenue', value: formatMoney(revenue) },
    ]

    return (
      <section className="admin-view">
        <div className="admin-view-intro">
          <p>Ringkasan operasional KopiKita.</p>
        </div>
        <div className="admin-metrics">
          {metrics.map((metric) => (
            <article className="admin-metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>
        <section className="admin-data-section">
          <div className="admin-section-heading">
            <div><span>Latest activity</span><h2>Recent orders</h2></div>
          </div>
          {renderOrdersTable(orders.slice(0, 5))}
        </section>
      </section>
    )
  }

  if (route === 'orders') {
    return (
      <section className="admin-view">
        <div className="admin-view-intro"><p>Periksa pesanan dan perbarui statusnya.</p></div>
        {renderOrdersTable(orders, true)}
      </section>
    )
  }

  if (route === 'products') {
    return (
      <section className="admin-view">
        <div className="admin-view-intro"><p>Kelola produk yang tampil di menu customer.</p></div>
        <div className="admin-products-layout">
          <form className="menu-form admin-product-form" onSubmit={onMenuSubmit}>
            <h2>{menuForm.id ? 'Edit product' : 'Add product'}</h2>
            <label>
              Nama menu
              <input type="text" value={menuForm.name} onChange={(event) => setMenuForm({ ...menuForm, name: event.target.value })} />
            </label>
            <div className="double-field">
              <label>
                Kategori
                <select value={menuForm.category} onChange={(event) => setMenuForm({ ...menuForm, category: event.target.value })}>
                  <option value="Coffee">Coffee</option>
                  <option value="Non Coffee">Non Coffee</option>
                  <option value="Signature">Signature</option>
                  <option value="Food">Food</option>
                </select>
              </label>
              <label>
                Harga
                <input type="number" value={menuForm.price} onChange={(event) => setMenuForm({ ...menuForm, price: event.target.value })} />
              </label>
            </div>
            <label>
              Deskripsi
              <textarea rows="4" value={menuForm.description} onChange={(event) => setMenuForm({ ...menuForm, description: event.target.value })} />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={menuForm.available} onChange={(event) => setMenuForm({ ...menuForm, available: event.target.checked })} />
              Tersedia untuk dipesan
            </label>
            <div className="admin-form-actions">
              <button type="submit" className="primary-btn small">{menuForm.id ? 'Simpan perubahan' : 'Tambah produk'}</button>
              {menuForm.id && (
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={() => setMenuForm({ id: null, name: '', category: 'Coffee', price: '', description: '', available: true })}
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {menu.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{formatMoney(item.price)}</td>
                    <td><span className={`admin-status${item.available ? '' : ' unavailable'}`}>{item.available ? 'Tersedia' : 'Habis'}</span></td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => onMenuEdit(item)}>Edit</button>
                        <button type="button" className="danger" onClick={() => onMenuDelete(item.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!menu.length && <tr><td className="admin-empty-cell" colSpan="5">Belum ada produk.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )
  }

  if (route === 'categories') {
    return (
      <section className="admin-view">
        <div className="admin-view-intro"><p>Kategori diturunkan dari produk yang sudah tersimpan.</p></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Category</th><th>Products</th><th>Available</th></tr></thead>
            <tbody>
              {categories.map((category) => {
                const categoryProducts = menu.filter((item) => item.category === category)
                return (
                  <tr key={category}>
                    <td>{category}</td>
                    <td>{categoryProducts.length}</td>
                    <td>{categoryProducts.filter((item) => item.available).length}</td>
                  </tr>
                )
              })}
              {!categories.length && <tr><td className="admin-empty-cell" colSpan="3">Belum ada kategori.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (route === 'customers') {
    return (
      <section className="admin-view">
        <div className="admin-view-intro"><p>Customer diringkas dari nama yang tercatat pada pesanan.</p></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Meja terakhir</th><th>Orders</th><th>Total order</th><th>Terakhir order</th></tr></thead>
            <tbody>
              {customers.map((customer) => {
                const latestOrder = orders
                  .filter((order) => order.customerName === customer.name)
                  .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0]
                return (
                  <tr key={customer.name}>
                    <td>{customer.name}</td>
                    <td>{latestOrder.tableNumber}</td>
                    <td>{customer.orderCount}</td>
                    <td>{formatMoney(customer.totalSpent)}</td>
                    <td>{formatDate(customer.latestOrder)}</td>
                  </tr>
                )
              })}
              {!customers.length && <tr><td className="admin-empty-cell" colSpan="5">Belum ada customer.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (route === 'payments') {
    return (
      <section className="admin-view">
        <div className="admin-view-intro"><p>Nilai pembayaran dihitung dari item pada order; belum ada data pembayaran terpisah.</p></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Waktu</th><th>Order status</th><th>Nilai order</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td><span className="admin-status">{order.status}</span></td>
                  <td>{formatMoney(orderTotal(order))}</td>
                </tr>
              ))}
              {!orders.length && <tr><td className="admin-empty-cell" colSpan="5">Belum ada order.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (route === 'settings') {
    return (
      <section className="admin-view">
        <div className="admin-view-intro"><p>Konfigurasi penyimpanan aplikasi.</p></div>
        <dl className="admin-settings-list">
          <div><dt>Mode data</dt><dd>{dataMode}</dd></div>
          <div><dt>Penyimpanan</dt><dd>{dataMode === 'Supabase' ? 'Supabase Database' : 'Browser localStorage'}</dd></div>
          <div><dt>Database / API</dt><dd>{dataMode === 'Supabase' ? 'Terhubung' : 'Belum terhubung'}</dd></div>
        </dl>
      </section>
    )
  }

  return <section className="admin-view"><h2>Halaman admin tidak ditemukan</h2></section>
}

export default AdminSection
