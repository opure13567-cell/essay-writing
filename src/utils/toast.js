/**
 * 轻量级 Toast 通知系统
 * 基于事件订阅，不依赖 React Context，可在任何地方调用
 */

const listeners = new Set()
let toastId = 0

export const TOAST_TYPES = {
  success: { bg: 'bg-green-600', icon: '✅' },
  error: { bg: 'bg-red-600', icon: '❌' },
  info: { bg: 'bg-blue-600', icon: 'ℹ️' },
  warning: { bg: 'bg-orange-500', icon: '⚠️' },
}

function emit(toast) {
  const id = ++toastId
  const entry = { id, ...toast, createdAt: Date.now() }
  listeners.forEach(fn => fn(entry))
  // 自动移除
  setTimeout(() => {
    listeners.forEach(fn => fn({ id, dismissed: true }))
  }, toast.duration || 4000)
}

export const toast = {
  success: (msg, opts) => emit({ type: 'success', message: msg, ...opts }),
  error: (msg, opts) => emit({ type: 'error', message: msg, ...opts }),
  info: (msg, opts) => emit({ type: 'info', message: msg, ...opts }),
  warning: (msg, opts) => emit({ type: 'warning', message: msg, ...opts }),
  /** 手动关闭 */
  dismiss: (id) => { listeners.forEach(fn => fn({ id, dismissed: true })) },
  /** 订阅 toast 事件，返回取消订阅函数 */
  subscribe: (fn) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}
