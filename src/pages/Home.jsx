import { useNavigate } from 'react-router-dom'

const PRICING = [
  { label: '短文（≤500字）', price: '¥2', examples: '读后感、活动总结、个人陈述' },
  { label: '中文（500-5000字）', price: '¥5', examples: '课程小论文、实验报告、演讲稿' },
  { label: '长文（5000-10万字）', price: '¥10', examples: '结课论文、毕业论文、调研报告' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-6">
        <div className="text-5xl mb-4">✍️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">写作助手</h1>
        <p className="text-gray-500 text-sm">
          AI智能润色 · 人工审核 · 优质交付
        </p>
      </div>

      {/* 定价 */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">服务定价</h2>
        {PRICING.map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <div className="font-medium text-gray-800">{item.label}</div>
              <div className="text-xs text-gray-400 mt-1">{item.examples}</div>
            </div>
            <div className="text-xl font-bold text-blue-600">{item.price}</div>
          </div>
        ))}
      </div>

      {/* 说明 */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 space-y-2">
        <p>📝 <strong>如何使用：</strong>提交作业要求 → 付款 → 等待写稿 → 在线取稿</p>
        <p>⚡ <strong>加急：</strong>24小时内完成，费用×1.5</p>
        <p>💰 <strong>封顶：</strong>最高30元/篇</p>
        <p>🤖 <strong>AI+人工：</strong>AI智能生成 + 人工审核润色，质量有保障</p>
      </div>

      {/* 按钮 */}
      <button
        onClick={() => navigate('/order/new')}
        className="w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        立即下单
      </button>
    </div>
  )
}
