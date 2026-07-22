### Task 6: 前端页面 — 首页 & 下单页

**文件:**
- 创建: `D:\essay-writing\src\pages\Home.jsx`
- 创建: `D:\essay-writing\src\components\OrderForm.jsx`
- 创建: `D:\essay-writing\src\pages\NewOrder.jsx`

**产出:** 首页可看到服务介绍和价格表，下单页可填写提交

- [ ] **Step 1: 创建首页**

```jsx
// src/pages/Home.jsx
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
```

- [ ] **Step 2: 创建 OrderForm 组件（下单页和后台共用）**

```jsx
// src/components/OrderForm.jsx
import { useState } from 'react'

const TYPES = [
  { value: 'essay', label: '课程论文' },
  { value: 'report', label: '实验/实习报告' },
  { value: 'reflection', label: '读后感' },
  { value: 'speech', label: '演讲稿' },
  { value: 'other', label: '其他' },
]

export default function OrderForm({ onSubmit, loading }) {
  const [type, setType] = useState('essay')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [isRush, setIsRush] = useState(false)

  const wordCount = description.replace(/[\s\n\r，。！？、；：""''（）《》【】\[\]{}.,!?;:'"()\-\/\\|@#$%^&*+=<>]/g, '').length

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!description.trim()) return
    onSubmit({ type, description: description.trim(), deadline: deadline || null, isRush })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 作业类型 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">作业类型</label>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`py-2 px-3 rounded-lg text-sm border transition-all ${
                type === t.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 作业要求 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          作业要求（复制粘贴文字即可）
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="请粘贴老师的作业要求、题目、要点等...&#10;&#10;越详细越好，AI会根据你的要求生成文章。"
          rows={8}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
        />
        {description && (
          <p className="text-xs text-gray-400 mt-1">
            已输入约 {wordCount} 字（不含标点和空格）
          </p>
        )}
      </div>

      {/* 截图上传（占位，后续扩展） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          截图/文件（可选，如作业是图片形式）
        </label>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400">
          📷 截图上传功能开发中，请先使用文字描述
        </div>
      </div>

      {/* 加急选项 */}
      <div className="flex items-center justify-between bg-orange-50 rounded-lg p-4">
        <div>
          <div className="font-medium text-gray-800 text-sm">⚡ 加急</div>
          <div className="text-xs text-gray-500">24小时内完成，费用×1.5</div>
        </div>
        <button
          type="button"
          onClick={() => setIsRush(!isRush)}
          className={`w-12 h-7 rounded-full transition-colors ${
            isRush ? 'bg-orange-500' : 'bg-gray-300'
          }`}
        >
          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
            isRush ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* 提交 */}
      <button
        type="submit"
        disabled={!description.trim() || loading}
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? '提交中...' : '提交订单，查看报价'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: 创建下单页**

```jsx
// src/pages/NewOrder.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrderForm from '../components/OrderForm'
import { api } from '../utils/api'

export default function NewOrder() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const order = await api.createOrder(data)
      navigate(`/order/${order.id}/pay`)
    } catch (err) {
      setError(err.message || '提交失败，请重试')
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">提交作业要求</h2>
      {error && (
        <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm mb-4">{error}</div>
      )}
      <OrderForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
```

- [ ] **Step 4: 验证**

首页显示正常，点击"立即下单"可进入下单页，填写后可提交（但API尚未上线，会报网络错误，属于正常）。

---

