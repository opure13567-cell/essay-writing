import { getUserToken } from './userToken'

const BASE = '/api'
const TIMEOUT_MS = 20000

async function request(method, path, body, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const options = {
        method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Token': getUserToken(),
        },
      }
      if (body) {
        options.body = JSON.stringify(body)
      }
      const res = await fetch(`${BASE}${path}`, options)
      clearTimeout(timer)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || '请求失败')
      }
      return data
    } catch (e) {
      clearTimeout(timer)
      if (e.name === 'AbortError') {
        if (i < retries) {
          await new Promise(r => setTimeout(r, 1000))
          continue
        }
        throw new Error('请求超时，请检查网络后重试')
      }
      if (i < retries) {
        await new Promise(r => setTimeout(r, 1000))
        continue
      }
      throw e
    }
  }
}

export const api = {
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

  adminLogin: (password) => request('POST', '/admin/auth', { password }),
  adminGetOrders: (password) => request('POST', '/admin/orders', { password }),
  adminGetOrderContent: (password, orderId) => request('POST', '/admin/order', { password, orderId }),
  adminConfirmPayment: (password, orderId) => request('POST', '/admin/confirm-payment', { password, orderId }),
  adminGenerateAI: (password, orderId) => request('POST', '/admin/generate', { password, orderId }),
  adminEditContent: (password, orderId, content) => request('POST', '/admin/edit-content', { password, orderId, content }),
  adminComplete: (password, orderId) => request('POST', '/admin/complete', { password, orderId }),
  adminGetConfig: (password) => request('POST', '/admin/config', { password }),
  adminUpdateConfig: (password, config) => request('POST', '/admin/config/update', { password, config }),
  adminGenerateProxy: async (password, prompt) => {
    const TIMEOUT_MS = 120000
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch('/api/admin/generate-proxy', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '请求失败')
      return data
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('AI生成超时，请稍后重试')
      throw e
    } finally {
      clearTimeout(timer)
    }
  },
  adminGetDeepseekKey: (password, orderId) => request('POST', '/admin/get-deepseek-key', { password, orderId }),
  adminUploadFile: async (password, orderId, file) => {
    const formData = new FormData()
    formData.append('password', password)
    formData.append('orderId', String(orderId))
    formData.append('file', file)
    const res = await fetch('/api/admin/upload-file', { method: 'POST', body: formData })
    return res.json()
  },
}
