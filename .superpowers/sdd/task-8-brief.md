### Task 8: 前端页面 — 管理后台

**文件:**
- 创建: `D:\essay-writing\src\pages\Admin.jsx`

**产出:** 管理后台完整可用（登录、订单管理、AI生成、发稿）

- [ ] **Step 1: 创建管理后台页面**

```jsx
// src/pages/Admin.jsx
import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import StatusBadge from '../components/StatusBadge'

export default function Admin() {
  const [password, setPassword] = useState(() => localStorage.getItem('admin_password') || '')
  const [authed, setAuthed] = useState(false)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState({})
  const [editContent, setEditContent] = useState({})
  const [activeTab, setActiveTab] = useState('all')

  // 尝试自动登录
  useEffect(() => {
    if (password) handleLogin(password)
  }, [])

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

  const loadOrders = async (pwd) => {
    setLoading(true)
    try {
      const data = await api.adminGetOrders(pwd || password)
      setOrders(data)
    } catch {}
    setLoading(false)
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
                <span className="text-sm text-green-600">✅ 已发稿</span>
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
```

- [ ] **Step 2: 验证**

确认管理后台登录流程、订单筛选、各个操作的交互逻辑正确。

---

