import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import StatusBadge from '../components/StatusBadge'

export default function OrderList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.getOrders()
      .then(data => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10 text-gray-400">加载中...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">我的订单</h2>
      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p>还没有订单</p>
          <button
            onClick={() => navigate('/order/new')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            去下单
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div
              key={order.id}
              onClick={() => navigate(`/order/${order.id}`)}
              className="bg-white border border-gray-100 rounded-lg p-4 active:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">#{order.id} · {order.type}</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{order.word_count}字 · ¥{order.price}</span>
                <span>{new Date(order.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
