import { getUserToken } from './userToken'

const BASE = '/api'

async function request(method, path, body) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': getUserToken(),
    },
  }
  if (body) {
    options.body = JSON.stringify(body)
  }
  const res = await fetch(`${BASE}${path}`, options)
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || '请求失败')
  }
  return data
}

export const api = {
  // 学生端
  createOrder: (data) => request('POST', '/orders', data),
  getOrders: () => request('GET', '/orders'),
  getOrder: (id) => request('GET', `/orders/${id}`),
  uploadPayment: (id, formData) => {
    // formData 包含 payment截图的 File
    return fetch(`${BASE}/orders/${id}/payment`, {
      method: 'POST',
      headers: { 'X-User-Token': getUserToken() },
      body: formData,
    }).then(r => r.json())
  },

  // 管理后台
  adminLogin: (password) => request('POST', '/admin/auth', { password }),
  adminGetOrders: (password) => request('POST', '/admin/orders', { password }),
  adminConfirmPayment: (password, orderId) => request('POST', '/admin/confirm-payment', { password, orderId }),
  adminGenerateAI: (password, orderId) => request('POST', '/admin/generate', { password, orderId }),
  adminEditContent: (password, orderId, content) => request('POST', '/admin/edit-content', { password, orderId, content }),
  adminComplete: (password, orderId) => request('POST', '/admin/complete', { password, orderId }),
  adminGetConfig: (password) => request('POST', '/admin/config', { password }),
  adminUpdateConfig: (password, config) => request('POST', '/admin/config/update', { password, config }),
}
