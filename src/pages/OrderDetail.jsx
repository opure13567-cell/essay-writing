import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { downloadDocx } from '../utils/generateDocx'

// 状态步骤定义
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

  // 自动刷新（未完成时每10秒拉取一次）
  useEffect(() => {
    let interval
    const fetchOrder = () => {
      api.getOrder(id).then(data => {
        setOrder(data)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
    fetchOrder()
    interval = setInterval(() => {
      if (!order || order.status !== 'done') {
        fetchOrder()
      }
    }, 10000)
    return () => clearInterval(interval)
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
      {/* 标题行 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">订单 #{order.id}</h2>
        <span className="text-xs text-gray-400">自动刷新中</span>
      </div>

      {/* 状态进度条 */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <StatusProgress status={order.status} />
      </div>

      {/* 完成通知横幅 */}
      {order.status === 'done' && (
        <div className="bg-green-500 text-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold mb-1">🎉 作业已完成！</div>
          <div className="text-sm opacity-90">请下载Word文件或一键复制内容</div>
        </div>
      )}

      {/* 订单信息 */}
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

      {/* 作业信息 */}
      <div>
        <h3 className="font-medium text-gray-700 mb-2">作业信息</h3>
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          {(() => {
            try {
              const qData = JSON.parse(order.description)
              if (qData.personal_info) {
                return (
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-gray-400">姓名</span><span>{qData.personal_info.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">学校</span><span>{qData.personal_info.school}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">家乡</span><span>{qData.personal_info.hometown || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">学号</span><span>{qData.personal_info.student_id}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">作业类型</span><span>{qData.assignment_type === 'hometown_change' ? '家乡变迁看制度优势' : '我的家风家训'}</span></div>
                  </div>
                )
              }
            } catch {}
            return <div className="whitespace-pre-wrap">{order.description}</div>
          })()}
        </div>
      </div>

      {/* 完成稿 */}
      {order.status === 'done' && finalContent && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">完成稿</h3>
            <div className="flex gap-2">
              <button
                onClick={() => downloadDocx(order)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-all"
              >
                📥 下载Word
              </button>
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
          </div>
          <p className="text-xs text-gray-400 mb-2">
            共 {finalContent.replace(/[\s\n\r]/g, '').length} 字
          </p>
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
             order.status === 'paid' ? '⏳' : '🤖'}
          </div>
          <p className="text-gray-500 text-sm">
            {order.status === 'pending_pay' && '请先完成付款，付款后自动开始生成'}
            {order.status === 'paid' && '已付款，管理员确认后将自动生成，请稍等...'}
            {order.status === 'writing' && 'AI正在为你生成论文，大约需要1-2分钟...'}
          </p>
          <p className="text-xs text-gray-400 mt-2">页面每10秒自动刷新，无需手动刷新</p>
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
