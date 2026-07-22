import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
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
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-blue-600">¥5</div>
        <div className="text-xs text-blue-500 mt-1">统一定价 · 含AI智能生成</div>
      </div>

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
            <p className="font-medium text-blue-800">请扫码付款 ¥5</p>
            <div className="bg-white rounded-lg p-4 inline-block">
              <img
                src="https://bxipdwwzkgpajcmmmulq.supabase.co/storage/v1/object/public/uploads/wixinshoukuanma.jpg"
                alt="微信收款码"
                className="w-48 h-48 object-contain rounded"
              />
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
