import { useNavigate } from 'react-router-dom'

const ASSIGNMENT_TYPES = [
  {
    id: 'family_tradition',
    title: '我的家风家训',
    subtitle: '形势与政策 · 社会调查报告',
    desc: '结合中华传统美德与红色家风，通过访谈梳理家风家训',
    icon: '🏠',
    words: '约5000字',
  },
  {
    id: 'hometown_change',
    title: '家乡变迁看制度优势',
    subtitle: '形势与政策 · 备选选题',
    desc: '从脱贫、乡村振兴、生态、科创等角度论述中国特色社会主义制度优势',
    icon: '🏙️',
    words: '约5000字',
    coming: true,
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="text-5xl mb-4">✍️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">形势与政策写作助手</h1>
        <p className="text-gray-500 text-sm">
          选择题式作答 · AI智能生成 · 5元/篇
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">选择作业类型</h2>
        {ASSIGNMENT_TYPES.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (!item.coming) navigate(`/order/new?type=${item.id}`)
            }}
            disabled={item.coming}
            className={`w-full text-left bg-white border-2 rounded-xl p-5 transition-all ${
              item.coming
                ? 'border-gray-100 opacity-50 cursor-not-allowed'
                : 'border-gray-100 hover:border-blue-300 hover:shadow-sm active:scale-[0.99]'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  {item.coming && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                      即将上线
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                <p className="text-sm text-gray-600 mt-2">{item.desc}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {item.words}
                  </span>
                  {!item.coming && (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      ¥5
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 space-y-2">
        <p>📝 <strong>如何使用：</strong>选择题作答 → 付款¥5 → AI自动生成报告</p>
        <p>🤖 <strong>AI生成：</strong>根据你的答案定制化生成，非套模板</p>
        <p>📋 <strong>格式规范：</strong>自动遵循课程排版要求（宋体/行距/页边距）</p>
      </div>
    </div>
  )
}
