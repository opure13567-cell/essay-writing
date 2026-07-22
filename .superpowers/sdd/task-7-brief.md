### Task 7: 前端页面 — 支付页 & 订单页

**文件:**
- 创建: `D:\essay-writing\src\pages\PayOrder.jsx`
- 创建: `D:\essay-writing\src\pages\OrderList.jsx`
- 创建: `D:\essay-writing\src\pages\OrderDetail.jsx`

**产出:** 支付流程页面完成，订单列表和详情页完成

- [ ] **Step 1: 创建支付页**

```jsx
// src/pages/PayOrder.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import PriceTag from '../components/PriceTag'
import StatusBadge from '../components/StatusBadge'

export default function PayOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getOrder(id).then(data => {
      setOrder(data)
      setLoading(false)
    }).catch(err => {
      setError('订单不存在')
      setLoading(false)
    })
  }, [id])

  const handleUploadPayment = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    // 将图片转base64，通过JSON传给后端
    // 简化方案：直接用Supabase上传，后端只存路径
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          // 通过后端上传（后端接收base64）
          const res = await fetch(`/api/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-User-Token': localStorage.getItem('essay_user_token') },
            body: JSON.stringify({ payment_screenshot: reader.result }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          setOrder(prev => ({ ...prev, status: 'paid', payment_screenshot: reader.result }))
        } catch (err) {
          setError(err.message || '上传失败')
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('文件读取失败')
      setUploading(false)
    }
  }

  if (loading) return <div className="text-center py-10 text-gray-400">加载中...</div>
  if (error && !order) return <div className="text-center py-10 text-red-500">{error}</div>
  if (!order) return null

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">确认付款</h2>

      {/* 价格展示 */}
      <PriceTag price={order.price} isRush={order.is_rush} />

      {/* 订单信息 */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">订单编号</span>
          <span className="text-gray-700">#{order.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">字数</span>
          <span className="text-gray-700">{order.word_count}字</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">状态</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* 付款截图区 */}
      {order.status === 'pending_pay' ? (
        <>
          <div className="bg-blue-50 rounded-lg p-4 text-center space-y-3">
            <p className="font-medium text-blue-800">请扫码付款 ¥{order.price}</p>
            <div className="bg-white rounded-lg p-4 inline-block">
              <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                收款码图片
                <br />
                （请在后台配置中上传）
              </div>
            </div>
            <p className="text-xs text-blue-600">长按保存收款码 → 打开微信/支付宝扫码付款</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📎 上传付款截图
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadPayment}
              disabled={uploading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && <p className="text-xs text-gray-400 mt-2">上传中...</p>}
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm">{error}</div>}
        </>
      ) : (
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-green-800 font-medium">付款截图已上传</p>
          <p className="text-sm text-green-600 mt-1">请等待确认收款后开始写稿</p>
          <button
            onClick={() => navigate(`/order/${order.id}`)}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            查看订单详情
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 创建订单列表页**

```jsx
// src/pages/OrderList.jsx
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
```

- [ ] **Step 3: 创建订单详情页**

```jsx
// src/pages/OrderDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import StatusBadge from '../components/StatusBadge'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.getOrder(id).then(data => { setOrder(data); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  const handleCopy = () => {
    const content = order?.edited_content || order?.ai_content || ''
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  if (loading) return <div className="text-center py-10 text-gray-400">加载中...</div>
  if (!order) return <div className="text-center py-10 text-red-500">订单不存在</div>

  const finalContent = order.edited_content || order.ai_content

  return (
    <div className="space-y-4">
      {/* 状态 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">订单 #{order.id}</h2>
        <StatusBadge status={order.status} />
      </div>

      {/* 订单信息 */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">类型</span>
          <span className="text-gray-700">{order.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">字数</span>
          <span className="text-gray-700">{order.word_count}字</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">金额</span>
          <span className="text-gray-700 font-medium">¥{order.price}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">提交时间</span>
          <span className="text-gray-700">{new Date(order.created_at).toLocaleString('zh-CN')}</span>
        </div>
        {order.is_rush && (
          <div className="flex justify-between">
            <span className="text-gray-500"></span>
            <span className="text-orange-500 font-medium">⚡ 加急订单</span>
          </div>
        )}
      </div>

      {/* 作业要求 */}
      <div>
        <h3 className="font-medium text-gray-700 mb-2">作业要求</h3>
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 whitespace-pre-wrap">
          {order.description}
        </div>
      </div>

      {/* 完成的内容 */}
      {order.status === 'done' && finalContent && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">完成稿</h3>
            <button
              onClick={handleCopy}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {copied ? '✅ 已复制' : '📋 一键复制'}
            </button>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {finalContent}
          </div>
        </div>
      )}

      {/* 未完成状态提示 */}
      {order.status !== 'done' && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">
            {order.status === 'pending_pay' ? '💳' :
             order.status === 'paid' ? '⏳' : '✍️'}
          </div>
          <p className="text-gray-500 text-sm">
            {order.status === 'pending_pay' && '请先完成付款'}
            {order.status === 'paid' && '已付款，等待确认后开始写稿'}
            {order.status === 'writing' && '正在写稿中，请耐心等待...'}
          </p>
          {order.status === 'pending_pay' && (
            <button
              onClick={() => navigate(`/order/${order.id}/pay`)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              去付款
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 验证**

确认各页面组件完整，逻辑正确，跳转链路通顺。

---

