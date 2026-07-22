import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import Admin from './Admin'

const ASSIGNMENT_TYPES = [
  {
    id: 'family_tradition',
    title: '我的家风家训',
    subtitle: '形势与政策 · 2025、2024级',
    desc: '结合中华传统美德与红色家风，通过访谈梳理家风家训',
    icon: '🏠',
    words: '约5000字',
  },
  {
    id: 'hometown_change',
    title: '家乡变迁看制度优势',
    subtitle: '形势与政策 · 2025、2024级',
    desc: '从脱贫、乡村振兴、生态、科创等角度论述中国特色社会主义制度优势',
    icon: '🏙️',
    words: '约5000字',
  },
  {
    id: 'industry_interview',
    title: '行业人物访谈报告',
    subtitle: '形势与政策 · 2023级',
    desc: '选择三位目标行业从业者进行深度访谈，从行业特点、发展前景等多角度撰写报告',
    icon: '👔',
    words: '约5000-10000字',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('admin_password'))
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminPwd, setAdminPwd] = useState('')
  const [adminError, setAdminError] = useState('')

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setAdminError('')
    try {
      await api.adminLogin(adminPwd)
      localStorage.setItem('admin_password', adminPwd)
      setIsAdmin(true)
    } catch {
      setAdminError('口令错误')
    }
  }

  // 如果已登录后台，直接显示后台面板
  if (isAdmin) {
    return (
      <div className="pb-4">
        <button
          onClick={() => { localStorage.removeItem('admin_password'); setIsAdmin(false) }}
          className="text-sm text-red-500 py-2"
        >
          ← 退出后台
        </button>
        <Admin />
      </div>
    )
  }

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

      {/* 管理入口 */}
      <div className="border-t border-gray-100 pt-4">
        {!showAdmin ? (
          <button
            onClick={() => setShowAdmin(true)}
            className="w-full text-center text-xs text-gray-300 hover:text-gray-400 py-2"
          >
            管理入口
          </button>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-3">
            <p className="text-sm font-medium text-gray-600 text-center">🔐 管理后台</p>
            <input
              type="password"
              value={adminPwd}
              onChange={e => setAdminPwd(e.target.value)}
              placeholder="请输入管理口令"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
            {adminError && <p className="text-red-500 text-xs text-center">{adminError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"
            >
              进入后台
            </button>
            <button
              type="button"
              onClick={() => setShowAdmin(false)}
              className="w-full text-xs text-gray-400 py-1"
            >
              取消
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
