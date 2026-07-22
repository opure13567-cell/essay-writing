### Task 5: 前端路由 & 布局组件

**文件:**
- 修改: `D:\essay-writing\src\App.jsx`
- 创建: `D:\essay-writing\src\components\Layout.jsx`
- 创建: `D:\essay-writing\src\components\StatusBadge.jsx`
- 创建: `D:\essay-writing\src\components\PriceTag.jsx`

**产出:** 路由骨架可导航，布局组件就绪

- [ ] **Step 1: 更新 App.jsx 添加路由**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import NewOrder from './pages/NewOrder'
import PayOrder from './pages/PayOrder'
import OrderList from './pages/OrderList'
import OrderDetail from './pages/OrderDetail'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order/new" element={<NewOrder />} />
          <Route path="/order/:id/pay" element={<PayOrder />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: 创建 Layout 组件**

```jsx
// src/components/Layout.jsx
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
          ✍️ 写作助手
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
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-50">
        AI写作参考素材 · 请勿直接提交为作业
      </footer>
    </div>
  )
}
```

- [ ] **Step 3: 创建 StatusBadge 组件**

```jsx
// src/components/StatusBadge.jsx
const STATUS_MAP = {
  pending_pay: { label: '待付款', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: '已付款·待确认', color: 'bg-blue-100 text-blue-700' },
  writing: { label: '写稿中', color: 'bg-purple-100 text-purple-700' },
  done: { label: '已完成', color: 'bg-green-100 text-green-700' },
}

export default function StatusBadge({ status }) {
  const info = STATUS_MAP[status] || { label: status, color: 'bg-gray-100' }
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  )
}
```

- [ ] **Step 4: 创建 PriceTag 组件**

```jsx
// src/components/PriceTag.jsx
export default function PriceTag({ price, isRush }) {
  return (
    <div className="text-center py-4">
      <div className="text-4xl font-bold text-blue-600">
        ¥{price}
      </div>
      {isRush && (
        <div className="text-xs text-orange-500 mt-1">含加急费</div>
      )}
      <div className="text-xs text-gray-400 mt-1">付款后24小时内完成</div>
    </div>
  )
}
```

- [ ] **Step 5: 运行验证**

```bash
cd D:\essay-writing && npm run dev
```

确认页面可以导航（虽然页面还是空的），没有控制台报错。

---

