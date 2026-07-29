import { useLocation, useNavigate } from 'react-router-dom'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = location.pathname === '/admin'

  if (isAdmin) return children

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white shadow-sm flex flex-col">
      {/* 顶部导航 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
        <button
          onClick={() => navigate('/')}
          className="text-lg font-bold text-blue-600"
        >
          ✍️ 形势与政策 · 论文助手
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          我的订单
        </button>
      </header>

      {/* 页面内容 */}
      <main className="flex-1 px-4 py-4">
        {children}
      </main>

      {/* 底部 */}
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-50 space-y-1">
        <p>🔒 充分尊重用户隐私，所有信息仅用于约定写作服务</p>
        <p>如有泄露，依法承担赔偿责任</p>
        <p>适用于 2023级—2025级 全体学生</p>
      </footer>
    </div>
  )
}
