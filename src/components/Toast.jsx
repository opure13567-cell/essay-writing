import { useState, useEffect } from 'react'
import { toast, TOAST_TYPES } from '../utils/toast'

export default function Toast() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const unsub = toast.subscribe((entry) => {
      if (entry.dismissed) {
        setItems(prev => prev.filter(t => t.id !== entry.id))
      } else {
        setItems(prev => [...prev, entry])
      }
    })
    return unsub
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {items.map(t => {
        const cfg = TOAST_TYPES[t.type] || TOAST_TYPES.info
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${cfg.bg} animate-slide-in`}
          >
            <span className="text-base leading-none">{cfg.icon}</span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-white/70 hover:text-white text-lg leading-none ml-2"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
