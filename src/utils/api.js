import { getUserToken } from './userToken'

const BASE = '/api'

async function request(method, path, body, retries = 2) {
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

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(`${BASE}${path}`, options)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || '请求失败')
      }
      return data
    } catch (e) {
      if (i < retries) {
        // 短暂等待后重试
        await new Promise(r => setTimeout(r, 1000))
        continue
      }
      throw e
    }
  }
}

export const api = {
  // 学生端
  createOrder: (data) => request('POST', '/orders', data),
  getOrders: () => request('GET', '/orders'),
  getOrder: (id) => request('GET', `/orders/${id}`),
  uploadPayment: (id, formData) => {
    return fetch(`${BASE}/orders/${id}/payment`, {
      method: 'POST',
      headers: { 'X-User-Token': getUserToken() },
      body: formData,
    }).then(r => r.json())
  },

  // 管理后台
  adminLogin: (password) => request('POST', '/admin/auth', { password }),
  adminGetOrders: (password) => request('POST', '/admin/orders', { password }),
  adminGetOrderContent: (password, orderId) => request('POST', '/admin/order', { password, orderId }),
  adminConfirmPayment: (password, orderId) => request('POST', '/admin/confirm-payment', { password, orderId }),
  adminGenerateAI: (password, orderId) => request('POST', '/admin/generate', { password, orderId }),
  adminGetDeepseekKey: (password, orderId) => request('POST', '/admin/get-deepseek-key', { password, orderId }),
  adminEditContent: (password, orderId, content) => request('POST', '/admin/edit-content', { password, orderId, content }),
  adminComplete: (password, orderId) => request('POST', '/admin/complete', { password, orderId }),
  adminGenerateProxy: (password, prompt) => request('POST', '/admin/generate-proxy', { password, prompt }),
  adminGetConfig: (password) => request('POST', '/admin/config', { password }),
  adminUpdateConfig: (password, config) => request('POST', '/admin/config/update', { password, config }),
  adminUploadFile: async (password, orderId, file) => {
    const formData = new FormData()
    formData.append('password', password)
    formData.append('orderId', String(orderId))
    formData.append('file', file)
    const res = await fetch('/api/admin/upload-file', { method: 'POST', body: formData })
    return res.json()
  },
}
