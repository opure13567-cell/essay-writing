import { useEffect, useRef } from 'react'

/**
 * 确认对话框
 * @param {{ isOpen: boolean, title: string, message: string, confirmLabel?: string, cancelLabel?: string, onConfirm: () => void, onCancel: () => void, variant?: 'danger'|'warning'|'info' }} props
 */
export default function ConfirmDialog({ isOpen, title, message, confirmLabel = '确认', cancelLabel = '取消', onConfirm, onCancel, variant = 'info' }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // 焦点移到确认按钮
      setTimeout(() => confirmRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const colorMap = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-orange-500 hover:bg-orange-600',
    info: 'bg-blue-600 hover:bg-blue-700',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      {/* 对话框 */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg text-white font-medium ${colorMap[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
