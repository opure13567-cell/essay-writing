import { Component } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Toast from './components/Toast'
import Home from './pages/Home'
import NewOrder from './pages/NewOrder'
import PayOrder from './pages/PayOrder'
import OrderList from './pages/OrderList'
import OrderDetail from './pages/OrderDetail'
import Admin from './pages/Admin'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error: error.message || '未知错误' }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <p style={{ fontSize: 40 }}>⚠️</p>
          <p style={{ color: '#666' }}>页面加载出错</p>
          <p style={{ fontSize: 12, color: '#999', wordBreak: 'break-all' }}>{this.state.error}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload() }}
            style={{ marginTop: 16, padding: '8px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14 }}
          >
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Toast />
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
    </ErrorBoundary>
  )
}
