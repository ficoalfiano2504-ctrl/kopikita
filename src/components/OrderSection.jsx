function OrderSection({
  cart,
  customerName,
  tableNumber,
  notes,
  totalCart,
  onCustomerNameChange,
  onTableNumberChange,
  onNotesChange,
  onAddQty,
  onReduceQty,
  onPlaceOrder,
  formatMoney,
}) {
  return (
    <section className="order-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Customer order</span>
          <h2>Pesan langsung dari web</h2>
        </div>
      </div>

      <div className="order-layout">
        <div className="cart-panel">
          <h3>Keranjang Saya</h3>
          {cart.length === 0 ? (
            <p className="empty-state">Belum ada menu yang dipilih.</p>
          ) : (
            <div className="cart-list">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div>
                    <h4>{item.name}</h4>
                    <p>{formatMoney(item.price)} / item</p>
                  </div>
                  <div className="cart-controls">
                    <button type="button" onClick={() => onReduceQty(item.id)}>
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => onAddQty(item.id)}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="total-box">
            <span>Total</span>
            <strong>{formatMoney(totalCart)}</strong>
          </div>
        </div>

        <form className="order-form" onSubmit={onPlaceOrder}>
          <label>
            Nama pelanggan
            <input
              type="text"
              value={customerName}
              onChange={(event) => onCustomerNameChange(event.target.value)}
              placeholder="Masukkan nama Anda"
            />
          </label>

          <label>
            Nomor meja
            <select value={tableNumber} onChange={(event) => onTableNumberChange(event.target.value)}>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="A3">A3</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="B3">B3</option>
              <option value="C1">C1</option>
            </select>
          </label>

          <label>
            Deskripsi pesanan
            <textarea
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Contoh: Pedas sedang, tanpa bawang, tambahan es batu..."
              rows="4"
            />
          </label>

          <div className="order-summary">
            <span>Metode</span>
            <strong>Delivery ke meja</strong>
          </div>

          <button type="submit" className="primary-btn submit-btn" disabled={!cart.length}>
            Pesan sekarang
          </button>
        </form>
      </div>
    </section>
  )
}

export default OrderSection
