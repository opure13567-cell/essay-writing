import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { getStudentName, setStudentName, getStudentId, setStudentId } from '../utils/userToken'

export default function OrderList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [querying, setQuerying] = useState(false)
  const [name, setName] = useState('')
  const [studentId, setStudentIdInput] = useState('')
  const [searched, setSearched] = useState(false)
  const navigate = useNavigate()

  // 初始加载：保存过姓名/学号就自动查询，否则先显示本机订单
  useEffect(() => {
    const savedName = getStudentName()
    const savedSid = getStudentId()
    if (savedName) setName(savedName)
    if (savedSid) setStudentIdInput(savedSid)
    if (savedName || savedSid) setSearched(true)
    api.getOrders()
      .then(data => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const n = name.trim()
    const s = studentId.trim()
    if (!n && !s) return
    setStudentName(n)
    setStudentId(s)
    setSearched(true)
    setQuerying(true)
    api.getOrders()
      .then(data => { setOrders(data); setQuerying(false) })
      .catch(() => setQuerying(false))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">我的订单</h2>

      {/* 姓名/学号查询 */}
      <form onSubmit={handleSearch} className="bg-white border border-gray-100 rounded-lg p-4 space-y-2">
        <p className="text-sm text-gray-600">
          📋 输入<b>姓名</b>或<b>姓名+学号</b>查询你的全部历史订单（换手机也能查到）
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="姓名"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={studentId}
            onChange={e => setStudentIdInput(e.target.value)}
            placeholder="学号（可选）"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={querying}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300"
        >
          {querying ? '⏳ 查询中...' : '🔍 查询订单'}
        </button>
      </form>

      {loading ? (
        <div className="text-center py-10 text-gray-400">加载中...</div>
      ) : querying ? (
        <div className="text-center py-10 text-gray-400">查询中...</div>
      ) : orders.length === 0 ? (
        searched ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p>没有找到匹配的订单，请核对姓名/学号</p>
            <p className="text-xs text-gray-300 mt-2">也可直接打开客服发你的订单链接查看</p>
          </div>
        ) : (
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
        )
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
