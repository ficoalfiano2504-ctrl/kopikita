import { supabase } from './supabase'

const throwOnError = ({ data, error }) => {
  if (error) throw error
  return data
}

const toMenuItem = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  price: row.price,
  description: row.description,
  available: row.available,
  image: row.image,
})

const toOrder = (row) => ({
  id: row.id,
  customerName: row.customer_name,
  tableNumber: row.table_number,
  notes: row.notes,
  createdAt: row.created_at,
  isDelivered: Boolean(row.is_delivered),
  deliveredAt: row.delivered_at,
  items: row.items,
})

const toMenuRow = ({ name, category, price, description, available, image }) => ({
  name,
  category,
  price,
  description,
  available,
  image: image || '',
})

export const fetchMenu = async () => {
  const data = throwOnError(await supabase.from('menu_items').select('*').order('id'))
  return data.map(toMenuItem)
}

export const fetchOrders = async () => {
  const data = throwOnError(await supabase.from('orders').select('*').order('created_at', { ascending: false }))
  return data.map(toOrder)
}

export const fetchWeeklyMenuSales = async () => {
  const data = throwOnError(await supabase.rpc('get_weekly_menu_sales'))
  return data.map((row) => ({ menuId: row.menu_id, quantity: row.quantity }))
}

export const createOrder = async (order) => {
  const orderData = {
    customer_name: order.customerName,
    table_number: order.tableNumber,
    notes: order.notes,
    items: order.items,
  }
  throwOnError(await supabase.from('orders').insert(orderData))
}

export const updateOrderDelivery = async (orderId, isDelivered) => {
  const data = throwOnError(await supabase
    .from('orders')
    .update({
      is_delivered: isDelivered,
      delivered_at: isDelivered ? new Date().toISOString() : null,
    })
    .eq('id', orderId)
    .select('id, is_delivered, delivered_at')
    .single())

  return {
    id: data.id,
    isDelivered: data.is_delivered,
    deliveredAt: data.delivered_at,
  }
}

export const createMenuItem = async (item) => {
  const data = throwOnError(await supabase.from('menu_items').insert(toMenuRow(item)).select().single())
  return toMenuItem(data)
}

export const updateMenuItem = async (item) => {
  const data = throwOnError(await supabase.from('menu_items').update(toMenuRow(item)).eq('id', item.id).select().single())
  return toMenuItem(data)
}

export const deleteMenuItem = async (itemId) => {
  throwOnError(await supabase.from('menu_items').delete().eq('id', itemId))
}

export const uploadMenuImage = async (file) => {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'webp'
  const filePath = `menu/${crypto.randomUUID()}.${extension}`
  const bucket = supabase.storage.from('menu-images')
  const data = throwOnError(await bucket.upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  }))

  return bucket.getPublicUrl(data.path).data.publicUrl
}
