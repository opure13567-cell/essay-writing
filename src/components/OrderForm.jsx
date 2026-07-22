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
