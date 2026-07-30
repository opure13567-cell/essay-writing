import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { downloadDocx } from '../utils/generateDocx'

const STEPS = [
  { key: 'pending_pay', label: '提交订单', icon: '📝' },
  { key: 'paid', label: '已付款', icon: '💳' },
  { key: 'writing', label: 'AI生成中', icon: '🤖' },
  { key: 'done', label: '已完成', icon: '✅' },
]

function StatusProgress({ status }) {
  const currentIdx = STEPS.findIndex(s => s.key === status)
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx
        const active = i === currentIdx
        return (
          <div key={step.key} className="flex items-center gap-1 flex-1">
            <div className={`flex flex-col items-center ${done ? 'opacity-100' : 'opacity-40'}`}>
              <span className={`text-lg ${active && status !== 'done' ? 'animate-bounce' : ''}`}>
                {step.icon}
              </span>
              <span className="text-[10px] whitespace-nowrap text-gray-500 mt-0.5">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const orderRef = useRef(null)

  // 同步 order 到 ref（避免闭包过期）
  useEffect(() => {
    orderRef.current = order
  }, [order])

  // 拉取订单 + 自动轮询
  useEffect(() => {
    let stopped = false
    let interval

    const fetchOrder = () => {
      api.getOrder(id).then(data => {
        if (stopped) return
        setOrder(data)
        setLoading(false)
      }).catch(() => {
        if (!stopped) setLoading(false)
      })
    }

    fetchOrder()

    interval = setInterval(() => {
      // 用 ref 读最新状态，避免闭包过期
      const current = orderRef.current
      if (current && current.status === 'done') {
        clearInterval(interval)
        return
      }
      fetchOrder()
    }, 10000)

    return () => {
      stopped = true
      clearInterval(interval)
    }
  }, [id])

  const handleCopy = () => {
    const content = order?.edited_content || order?.ai_content || ''
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => {
        // 降级方案：手动选择复制
        const ta = document.createElement('textarea')
        ta.value = content
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  if (loading) return <div className="text-center py-10 text-gray-400">加载中...</div>
  if (!order) return <div className="text-center py-10 text-red-500">订单不存在，请检查链接</div>

  const finalContent = order.edited_content || order.ai_content

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">订单 #{order.id}</h2>
        {order.status !== 'done' && <span className="text-xs text-gray-400">自动刷新中</span>}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <StatusProgress status={order.status} />
      </div>

      {order.status === 'done' && (
        <div className="bg-green-500 text-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold mb-1">作业已完成！</div>
          <div className="text-sm opacity-90">请下载Word文件或一键复制内容</div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">类型</span>
          <span className="text-gray-700">{order.type === 'family_tradition' ? '我的家风家训' : order.type === 'hometown_change' ? '家乡变迁看制度优势' : order.type}</span>
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
      </div>

      {/* 完成稿 — 有上传修改稿就优先显示下载链接 */}
      {order.status === 'done' && (
        <div>
          {order.plagiarism_report ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">📄</div>
              <a href={order.plagiarism_report} download className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                下载修改稿
              </a>
              <p className="text-xs text-gray-400 mt-2">点击下载修改后的Word文件，用WPS打开</p>
            </div>
          ) : finalContent ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-700">完成稿</h3>
                <div className="flex gap-2">
                  <button onClick={() => downloadDocx(order)} className="px-4 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200">
                    下载Word
                  </button>
                  <button onClick={handleCopy} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${copied ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                    {copied ? '已复制' : '一键复制'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                共 {finalContent.replace(/[\s\n\r]/g, '').length} 字
              </p>
              <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {finalContent}
              </div>
            </>
          ) : null}
        </div>
      )}

      {order.status !== 'done' && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">
            {order.status === 'pending_pay' ? '💳' : order.status === 'paid' ? '⏳' : '🤖'}
          </div>
          <p className="text-gray-500 text-sm">
            {order.status === 'pending_pay' && '请先完成付款'}
            {order.status === 'paid' && '已付款，等待管理员确认后开始生成'}
            {order.status === 'writing' && 'AI正在生成中，大约1-2分钟...'}
          </p>
          <p className="text-xs text-gray-400 mt-2">页面每10秒自动刷新</p>
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
