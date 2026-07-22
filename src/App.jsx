import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import NewOrder from './pages/NewOrder'
import PayOrder from './pages/PayOrder'
import OrderList from './pages/OrderList'
import OrderDetail from './pages/OrderDetail'
import Admin from './pages/Admin'

export default function App() {
  return (
    <HashRouter>
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
    </HashRouter>
  )
}
