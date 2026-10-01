import { useEffect, useRef, useState } from 'react'

function AdminSection({
  pathname,
  orders,
  onDeliveryChange,
  menu,
  menuForm,
  setMenuForm,
  onMenuSubmit,
  onMenuEdit,
  onMenuDelete,
  formatMoney,
  dataMode,
  onUploadMenuImage,
}) {
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [deliveryUpdates, setDeliveryUpdates] = useState(() => new Set())
  const [reportDate, setReportDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })
  const imagePreviewUrl = useRef('')
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
  const toDateInputValue = (value) => {
    const date = new Date(value)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  const pendingOrders = orders.filter((order) => !order.isDelivered)
  const deliveredOrders = orders.filter((order) => order.isDelivered)
  const dailyDeliveredOrders = orders.filter((order) => (
    order.isDelivered
    && order.deliveredAt
    && toDateInputValue(order.deliveredAt) === reportDate
  ))
  const dailyIncome = dailyDeliveredOrders.reduce((sum, order) => sum + orderTotal(order), 0)

  useEffect(() => () => {
    if (imagePreviewUrl.current) URL.revokeObjectURL(imagePreviewUrl.current)
  }, [])

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Pilih gambar JPG, PNG, atau WebP.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Ukuran gambar maksimal 5 MB.')
      event.target.value = ''
      return
    }

    if (imagePreviewUrl.current) URL.revokeObjectURL(imagePreviewUrl.current)
    imagePreviewUrl.current = URL.createObjectURL(file)
    setImagePreview(imagePreviewUrl.current)
    setImageError('')
    setImageUploading(true)

    try {
      const imageUrl = await onUploadMenuImage(file)
      setMenuForm((current) => ({ ...current, image: imageUrl }))
      if (imagePreviewUrl.current) URL.revokeObjectURL(imagePreviewUrl.current)
      imagePreviewUrl.current = ''
      setImagePreview('')
    } catch (error) {
      setImageError(error.message || 'Gambar gagal diunggah.')
    } finally {
      setImageUploading(false)
      event.target.value = ''
    }
  }

  const clearImagePreview = () => {
    if (imagePreviewUrl.current) URL.revokeObjectURL(imagePreviewUrl.current)
    imagePreviewUrl.current = ''
    setImagePreview('')
    setImageError('')
  }

  const handleDeliveryToggle = async (order, isDelivered) => {
    setDeliveryUpdates((current) => new Set(current).add(order.id))
    try {
      await onDeliveryChange(order.id, isDelivered)
    } finally {
      setDeliveryUpdates((current) => {
        const next = new Set(current)
        next.delete(order.id)
        return next
      })
    }
  }

  const downloadDailyIncome = async () => {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF()
    const reportDateLabel = new Date(`${reportDate}T12:00:00`).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    let y = 18

    pdf.setFontSize(18)
    pdf.text('Laporan Pemasukan Harian', 14, y)
    y += 9
    pdf.setFontSize(10)
    pdf.text(`Tanggal: ${reportDateLabel}`, 14, y)
    y += 7
    pdf.text(`Pesanan diantar: ${dailyDeliveredOrders.length}`, 14, y)
    y += 7
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Total pemasukan: ${formatMoney(dailyIncome)}`, 14, y)
    pdf.setFont('helvetica', 'normal')
    y += 12

    if (!dailyDeliveredOrders.length) {
      pdf.text('Tidak ada pesanan yang diantar pada tanggal ini.', 14, y)
    }

    dailyDeliveredOrders.forEach((order) => {
      if (y > 270) {
        pdf.addPage()
        y = 18
      }

      pdf.setFont('helvetica', 'bold')
      pdf.text(`#${order.id} | ${order.customerName} | Meja ${order.tableNumber}`, 14, y)
      pdf.setFont('helvetica', 'normal')
      y += 6
      pdf.text(`Diantar: ${formatDate(order.deliveredAt)}`, 14, y)
      y += 6

      order.items.forEach((item) => {
        const itemLines = pdf.splitTextToSize(
          `${item.qty}x ${item.name} - ${formatMoney(item.price * item.qty)}`,
          180,
        )
        if (y + itemLines.length * 5 > 280) {
          pdf.addPage()
          y = 18
        }
        pdf.text(itemLines, 14, y)
        y += itemLines.length * 5
      })

      pdf.setFont('helvetica', 'bold')
      pdf.text(`Total order: ${formatMoney(orderTotal(order))}`, 14, y)
      pdf.setFont('helvetica', 'normal')
      y += 10
    })

    pdf.save(`pemasukan-${reportDate}.pdf`)
  }

  const renderOrdersTable = (rows, showDeliveryCheckbox = false) => (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Meja</th>
            <th>Waktu</th>
            <th>Total</th>
            {showDeliveryCheckbox && <th>Pengantaran</th>}
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
              {showDeliveryCheckbox && (
                <td>
                  <label className="admin-delivery-check">
                    <input
                      type="checkbox"
                      checked={Boolean(order.isDelivered)}
                      disabled={deliveryUpdates.has(order.id)}
                      onChange={(event) => handleDeliveryToggle(order, event.target.checked)}
                    />
                    <span>{order.isDelivered ? 'Sudah diantar' : 'Tandai diantar'}</span>
                  </label>
                </td>
              )}
            </tr>
          ))}
          {!rows.length && (
            <tr><td className="admin-empty-cell" colSpan={showDeliveryCheckbox ? 6 : 5}>Tidak ada pesanan.</td></tr>
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
        <div className="admin-view-intro">
          <p>Kelola pengantaran dan unduh laporan pemasukan harian.</p>
        </div>

        <section className="admin-income-report">
          <div>
            <span>Pemasukan pada tanggal dipilih</span>
            <strong>{formatMoney(dailyIncome)}</strong>
            <small>{dailyDeliveredOrders.length} pesanan diantar</small>
          </div>
          <label>
            Tanggal laporan
            <input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} />
          </label>
          <button type="button" className="primary-btn small" onClick={downloadDailyIncome}>
            Unduh PDF
          </button>
        </section>

        <section className="admin-delivery-group">
          <div className="admin-section-heading">
            <div><span>Menunggu pengantaran</span><h2>Belum diantar</h2></div>
            <span>{pendingOrders.length} pesanan</span>
          </div>
          {renderOrdersTable(pendingOrders, true)}
        </section>

        <section className="admin-delivery-group">
          <div className="admin-section-heading">
            <div><span>Selesai dikirim</span><h2>Sudah diantar</h2></div>
            <span>{deliveredOrders.length} pesanan</span>
          </div>
          {renderOrdersTable(deliveredOrders, true)}
        </section>
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
            <label>
              Foto menu
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                disabled={imageUploading}
              />
            </label>
            {(imagePreview || menuForm.image) && (
              <img
                className="admin-menu-image-preview"
                src={imagePreview || menuForm.image}
                alt="Preview foto menu"
              />
            )}
            {imageUploading && <p className="admin-image-status">Mengunggah foto...</p>}
            {imageError && <p className="admin-login-error" role="alert">{imageError}</p>}
            <label className="checkbox-row">
              <input type="checkbox" checked={menuForm.available} onChange={(event) => setMenuForm({ ...menuForm, available: event.target.checked })} />
              Tersedia untuk dipesan
            </label>
            <div className="admin-form-actions">
              <button type="submit" className="primary-btn small" disabled={imageUploading}>{menuForm.id ? 'Simpan perubahan' : 'Tambah produk'}</button>
              {menuForm.id && (
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={() => {
                    clearImagePreview()
                    setMenuForm({ id: null, name: '', category: 'Coffee', price: '', description: '', available: true, image: '' })
                  }}
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Foto</th><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {menu.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.image && <img className="admin-product-thumb" src={item.image} alt={item.name} />}
                    </td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{formatMoney(item.price)}</td>
                    <td><span className={`admin-status${item.available ? '' : ' unavailable'}`}>{item.available ? 'Tersedia' : 'Habis'}</span></td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => { clearImagePreview(); onMenuEdit(item) }}>Edit</button>
                        <button type="button" className="danger" onClick={() => onMenuDelete(item.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!menu.length && <tr><td className="admin-empty-cell" colSpan="6">Belum ada produk.</td></tr>}
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
            <thead><tr><th>Order</th><th>Customer</th><th>Waktu</th><th>Nilai order</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{formatMoney(orderTotal(order))}</td>
                </tr>
              ))}
              {!orders.length && <tr><td className="admin-empty-cell" colSpan="4">Belum ada order.</td></tr>}
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
