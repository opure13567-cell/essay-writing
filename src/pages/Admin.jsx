import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../utils/api'
import { downloadDocx } from '../utils/generateDocx'
import StatusBadge from '../components/StatusBadge'

// 新订单通知音（简短提示音）
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    osc.type = 'sine'
    gain.gain.value = 0.3
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc.stop(ctx.currentTime + 0.5)
  } catch {}
}

export default function Admin() {
  const [password, setPassword] = useState(() => localStorage.getItem('admin_password') || '')
  const [authed, setAuthed] = useState(false)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState({})
  const [editContent, setEditContent] = useState({})
  const [activeTab, setActiveTab] = useState('all')
  const [newOrderAlert, setNewOrderAlert] = useState(false)
  const knownIdsRef = useRef(new Set())

  // 自动刷新订单（每30秒）
  const loadOrders = useCallback(async (pwd) => {
    setLoading(true)
    try {
      const data = await api.adminGetOrders(pwd || password)
      // 检测新订单
      const prevIds = knownIdsRef.current
      const newOnes = data.filter(o => !prevIds.has(o.id))
      if (newOnes.length > 0 && prevIds.size > 0) {
        playNotificationSound()
        setNewOrderAlert(true)
        setTimeout(() => setNewOrderAlert(false), 5000)
        // 浏览器通知
        if (Notification.permission === 'granted') {
          new Notification(`新订单！${newOnes[0].type}`, {
            body: `有 ${newOnes.length} 个新订单，¥${newOnes[0].price}`,
            icon: '✍️',
          })
        }
      }
      // 更新已知ID
      knownIdsRef.current = new Set(data.map(o => o.id))
      setOrders(data)
    } catch {}
    setLoading(false)
  }, [password])

  // 尝试自动登录
  useEffect(() => {
    if (password) handleLogin(password)
  }, [])

  // 请求通知权限
  useEffect(() => {
    if (authed && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [authed])

  // 自动轮询
  useEffect(() => {
    if (!authed) return
    const interval = setInterval(() => loadOrders(), 30000)
    return () => clearInterval(interval)
  }, [authed, loadOrders])

  const handleLogin = async (pwd) => {
    try {
      await api.adminLogin(pwd)
      localStorage.setItem('admin_password', pwd)
      setPassword(pwd)
      setAuthed(true)
      loadOrders(pwd)
    } catch {
      setAuthed(false)
    }
  }

  const handleConfirmPayment = async (orderId) => {
    try {
      await api.adminConfirmPayment(password, orderId)
      loadOrders()
    } catch (err) {
      alert('确认失败: ' + err.message)
    }
  }

  const handleGenerate = async (orderId) => {
    setGenerating(prev => ({ ...prev, [orderId]: true }))
    try {
      const result = await api.adminGenerateAI(password, orderId)
      setEditContent(prev => ({ ...prev, [orderId]: result.content }))
      loadOrders()
    } catch (err) {
      alert('AI生成失败: ' + err.message)
    }
    setGenerating(prev => ({ ...prev, [orderId]: false }))
  }

  const handleComplete = async (orderId) => {
    const content = editContent[orderId]
    if (content) {
      try {
        await api.adminEditContent(password, orderId, content)
      } catch {}
    }
    try {
      await api.adminComplete(password, orderId)
      loadOrders()
    } catch (err) {
      alert('发稿失败: ' + err.message)
    }
  }

  const handleRefresh = () => loadOrders()

  // 登录界面
  if (!authed) {
    return (
      <div className="max-w-sm mx-auto py-20 px-4">
        <h2 className="text-xl font-bold text-center mb-6">🔐 管理后台</h2>
        <form onSubmit={e => { e.preventDefault(); handleLogin(password); }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入管理口令"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            登录
          </button>
        </form>
      </div>
    )
  }

  // 筛选订单
  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'paid', label: '待确认' },
    { key: 'writing', label: '写稿中' },
    { key: 'done', label: '已完成' },
  ]

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === activeTab)

  const newPaidCount = orders.filter(o => o.status === 'paid').length

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {newOrderAlert && (
        <div className="bg-red-500 text-white text-center py-2 px-4 rounded-lg mb-3 animate-pulse text-sm font-medium">
          🔔 有新订单！已自动刷新
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">🔐 管理后台</h2>
        <button onClick={handleRefresh} className="text-sm text-blue-600">
          {loading ? '刷新中...' : '🔄 刷新'}
        </button>
      </div>

      {/* Tab切换 */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {tab.label}
            {tab.key === 'paid' && newPaidCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {newPaidCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 订单列表 */}
      <div className="space-y-3">
        {filteredOrders.map(order => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">#{order.id} · ¥{order.price}</span>
              <StatusBadge status={order.status} />
            </div>

            <div className="text-xs text-gray-500">
              {order.word_count}字 · {order.type}
              {order.is_rush && ' · ⚡加急'} · {new Date(order.created_at).toLocaleString('zh-CN')}
            </div>

            <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 max-h-20 overflow-y-auto">
              {order.description}
            </div>

            {/* 付款截图 */}
            {order.payment_screenshot && (
              <div>
                <span className="text-xs text-gray-400">付款截图：</span>
                <a
                  href={order.payment_screenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs text-blue-600 underline"
                >
                  点击查看大图
                </a>
                <img
                  src={order.payment_screenshot}
                  alt="付款截图"
                  className="mt-1 rounded border border-gray-300 block"
                  style={{ width: '160px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <span className="hidden text-xs text-red-400 mt-1">
                  无法加载预览，请点击上方链接查看
                </span>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 flex-wrap">
              {/* 待确认付款 */}
              {order.status === 'paid' && (
                <button
                  onClick={() => handleConfirmPayment(order.id)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  ✅ 确认收款
                </button>
              )}

              {/* AI生成按钮 */}
              {(order.status === 'writing' || order.status === 'paid') && (
                <button
                  onClick={() => handleGenerate(order.id)}
                  disabled={generating[order.id]}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
                >
                  {generating[order.id] ? '🤖 生成中...' : '🤖 AI生成'}
                </button>
              )}

              {/* 编辑/发稿 */}
              {order.ai_content && order.status !== 'done' && (
                <>
                  <button
                    onClick={() => handleComplete(order.id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    📤 发稿
                  </button>
                </>
              )}

              {order.status === 'done' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">✅ 已发稿</span>
                  <button
                    onClick={() => downloadDocx(order)}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200"
                  >
                    📥 下载Word
                  </button>
                </div>
              )}
            </div>

            {/* AI生成内容编辑区 */}
            {(order.ai_content || editContent[order.id]) && order.status !== 'done' && (
              <div>
                <textarea
                  value={editContent[order.id] ?? order.ai_content}
                  onChange={e => setEditContent(prev => ({ ...prev, [order.id]: e.target.value }))}
                  rows={8}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 resize-none"
                  placeholder="AI生成的文章..."
                />
              </div>
            )}

            {/* 最终内容预览（已发稿的） */}
            {order.status === 'done' && order.edited_content && (
              <details className="text-xs">
                <summary className="text-gray-500 cursor-pointer">查看最终内容</summary>
                <div className="bg-green-50 rounded p-3 mt-2 whitespace-pre-wrap text-gray-700">
                  {order.edited_content}
                </div>
              </details>
            )}
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-10 text-gray-400">暂无订单</div>
        )}
      </div>

      {/* 底部工具栏 */}
      <div className="mt-8 pt-4 border-t border-gray-100 text-center">
        <button
          onClick={() => {
            localStorage.removeItem('admin_password')
            setAuthed(false)
            setPassword('')
          }}
          className="text-sm text-red-500"
        >
          退出登录
        </button>
      </div>
    </div>
  )
}
