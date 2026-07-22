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
