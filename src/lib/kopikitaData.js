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
  status: row.status,
  createdAt: row.created_at,
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

export const createOrder = async (order) => {
  throwOnError(await supabase.from('orders').insert({
    customer_name: order.customerName,
    table_number: order.tableNumber,
    notes: order.notes,
    status: order.status,
    items: order.items,
  }))
}

export const updateOrderStatus = async (orderId, status) => {
  throwOnError(await supabase.from('orders').update({ status }).eq('id', orderId))
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
