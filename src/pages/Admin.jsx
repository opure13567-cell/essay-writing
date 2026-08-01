import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../utils/api'
import { downloadDocx } from '../utils/generateDocx'
import { toast } from '../utils/toast'
import { filterOrders, searchOrders } from '../utils/admin'
import { playNotificationSound, requestNotificationPermission, sendBrowserNotification } from '../utils/notification'
import AdminLogin from '../components/admin/AdminLogin'
import AdminDashboard from '../components/admin/AdminDashboard'
import OrderFilters from '../components/admin/OrderFilters'
import OrderCard from '../components/admin/OrderCard'
import ConfigPanel from '../components/admin/ConfigPanel'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Admin() {
  // --- auth state ---
  const [password, setPassword] = useState(() => sessionStorage.getItem('admin_password') || '')
  const [authed, setAuthed] = useState(false)

  // --- data state ---
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState({})
  const [loadingStates, setLoadingStates] = useState({})
  const [editContent, setEditContent] = useState({})

  // --- ui state ---
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [newOrderAlert, setNewOrderAlert] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  // --- confirm dialog state ---
  const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null })

  // --- refs ---
  const knownIdsRef = useRef(new Set())
  const audioCtxRef = useRef(null)
  const pollingRef = useRef(null)

  // --- 加载订单 ---
  const loadOrders = useCallback(async (pwd) => {
    const pw = pwd || password
    if (!pw) return
    setLoading(true)
    try {
      const data = await api.adminGetOrders(pw)
      // 检测新订单
      const prevIds = knownIdsRef.current
      const newOnes = data.filter(o => !prevIds.has(o.id))
      if (newOnes.length > 0 && prevIds.size > 0) {
        playNotificationSound()
        setNewOrderAlert(true)
        setTimeout(() => setNewOrderAlert(false), 5000)
        sendBrowserNotification('新订单', `有 ${newOnes.length} 个新订单，¥${newOnes[0].price}`)
      }
      knownIdsRef.current = new Set(data.map(o => o.id))
      setOrders(data)
      setLastRefresh(new Date())
    } catch (err) {
      if (err.message !== '口令错误') {
        toast.error('加载订单失败: ' + err.message)
      }
    }
    setLoading(false)
  }, [password])

  // --- 自动登录 ---
  useEffect(() => {
    if (password) handleLogin(password, true)
  }, [])

  // --- 请求通知权限 ---
  useEffect(() => {
    if (authed) requestNotificationPermission()
  }, [authed])

  // --- 轮询（带可见性优化）---
  useEffect(() => {
    if (!authed) return

    const startPolling = () => {
      pollingRef.current = setInterval(() => loadOrders(), 30000)
    }
    const stopPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }

    startPolling()

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        loadOrders()
        startPolling()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [authed, loadOrders])

  // --- 登录 ---
  const handleLogin = async (pwd, isAuto) => {
    try {
      await api.adminLogin(pwd)
      sessionStorage.setItem('admin_password', pwd)
      setPassword(pwd)
      setAuthed(true)
      loadOrders(pwd)
    } catch {
      if (!isAuto) toast.error('口令错误')
      setAuthed(false)
    }
  }

  // --- 确认收款 ---
  const handleConfirmPayment = async (orderId) => {
    setLoadingStates(prev => ({ ...prev, confirm: true }))
    try {
      await api.adminConfirmPayment(password, orderId)
      toast.success('已确认收款，AI生成已启动')
      loadOrders()
    } catch (err) {
      toast.error('确认失败: ' + err.message)
    }
    setLoadingStates(prev => ({ ...prev, confirm: false }))
  }

  // --- AI生成 ---
  const handleGenerate = async (orderId) => {
    setGenerating(prev => ({ ...prev, [orderId]: true }))
    try {
      const order = orders.find(o => o.id === orderId)
      const wordCount = order?.word_count || 5000
      const typeLabels = { family_tradition: '我的家风家训调查报告', hometown_change: '家乡变迁看制度优势调查报告', industry_interview: '行业人物访谈报告' }
      const label = typeLabels[order?.type] || '调查报告'
      const prompt = `你是一名大学本科生。请根据素材写一篇${label}，字数约${wordCount}字。

标题自拟，包含：摘要+关键词、正文（4-6章）、附录。
用第一人称我，口语化。
禁止：首先其次最后、综上所述、值得注意的是、不可否认、随着...的发展
家训概括成八个字。

素材：${order?.description || ''}`

      const result = await api.adminGenerateProxy(password, prompt)
      if (result?.content) {
        await api.adminEditContent(password, orderId, result.content)
        setEditContent(prev => ({ ...prev, [orderId]: result.content }))
        toast.success('AI内容生成成功')
        loadOrders()
      } else {
        toast.warning('生成内容为空')
      }
    } catch (err) {
      toast.error('AI生成失败: ' + err.message)
    }
    setGenerating(prev => ({ ...prev, [orderId]: false }))
  }

  // --- 保存编辑内容 ---
  const handleSaveContent = async (orderId, content) => {
    await api.adminEditContent(password, orderId, content)
    setEditContent(prev => ({ ...prev, [orderId]: content }))
    loadOrders()
  }

  // --- 发稿 ---
  const handleComplete = async (orderId) => {
    setLoadingStates(prev => ({ ...prev, publish: true }))
    try {
      await api.adminComplete(password, orderId)
      toast.success('✅ 已发稿！（发送的是最终稿件）')
      loadOrders()
    } catch (err) {
      toast.error('发稿失败: ' + err.message)
    }
    setLoadingStates(prev => ({ ...prev, publish: false }))
  }

  const requestComplete = (orderId) => {
    setConfirm({
      isOpen: true,
      title: '确认发稿',
      message: '确认将此订单的最终稿发给客户？此操作不可撤销。',
      onConfirm: () => {
        setConfirm(prev => ({ ...prev, isOpen: false }))
        handleComplete(orderId)
      },
    })
  }

  // --- 上传文件 ---
  const handleUploadFile = async (orderId, file) => {
    setLoadingStates(prev => ({ ...prev, upload: true }))
    try {
      const result = await api.adminUploadFile(password, orderId, file)
      if (result.url) {
        toast.success('修改稿上传成功')
        loadOrders()
      } else {
        toast.error('上传失败: ' + (result.error || '未知错误'))
      }
    } catch (err) {
      toast.error('上传失败: ' + err.message)
    }
    setLoadingStates(prev => ({ ...prev, upload: false }))
  }

  // --- 删除订单 ---
  const handleDeleteOrder = async (orderId) => {
    setLoadingStates(prev => ({ ...prev, delete: true }))
    try {
      await api.adminDeleteOrder(password, orderId)
      toast.success('订单已删除')
      loadOrders()
    } catch (err) {
      toast.error('删除失败: ' + err.message)
    }
    setLoadingStates(prev => ({ ...prev, delete: false }))
  }

  const requestDeleteOrder = (order) => {
    setConfirm({
      isOpen: true,
      title: '删除订单',
      message: `确定要删除订单 #${order.id} 吗？该订单的付款截图、AI内容和上传的修改稿都会被永久删除，且不可恢复。`,
      onConfirm: () => {
        setConfirm(prev => ({ ...prev, isOpen: false }))
        handleDeleteOrder(order.id)
      },
    })
  }

  // --- 下载 ---
  const handleDownload = (order) => {
    downloadDocx(order)
  }

  // --- 退出 ---
  const handleLogout = () => {
    sessionStorage.removeItem('admin_password')
    setPassword('')
    setAuthed(false)
    setOrders([])
    toast.info('已退出登录')
  }

  const requestLogout = () => {
    setConfirm({
      isOpen: true,
      title: '退出登录',
      message: '确定要退出管理后台吗？',
      onConfirm: () => {
        setConfirm(prev => ({ ...prev, isOpen: false }))
        handleLogout()
      },
    })
  }

  // ====== 渲染 ======

  // 登录界面
  if (!authed) {
    return <AdminLogin onLogin={handleLogin} initialPassword={password} />
  }

  // 筛选 + 搜索
  const paidCount = orders.filter(o => o.status === 'paid').length
  const filteredByTab = filterOrders(orders, activeTab)
  const displayedOrders = searchOrders(filteredByTab, searchQuery)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      {/* 新订单提示 */}
      {newOrderAlert && (
        <div className="bg-red-500 text-white text-center py-2 px-4 rounded-lg mb-3 animate-pulse text-sm font-medium">
          🔔 有新订单！已自动刷新
        </div>
      )}

      {/* 顶栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">🔐 管理后台</h2>
          <button
            onClick={() => loadOrders()}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {loading ? '⟳ 刷新中...' : '🔄 刷新'}
          </button>
          {lastRefresh && (
            <span className="text-[10px] text-gray-400 hidden sm:inline">
              更新于 {lastRefresh.toLocaleTimeString('zh-CN')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(true)}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            ⚙️ 设置
          </button>
          <button
            onClick={requestLogout}
            className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg"
          >
            退出
          </button>
        </div>
      </div>

      {/* 统计看板 */}
      <AdminDashboard orders={orders} />

      {/* 筛选栏 */}
      <OrderFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paidCount={paidCount}
      />

      {/* 订单列表 */}
      {displayedOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">
            {activeTab === 'all' && !searchQuery ? '📭' : '🔍'}
          </div>
          <p>{searchQuery ? '没有匹配的订单' : activeTab === 'paid' ? '暂无待确认订单' : activeTab === 'writing' ? '暂无写稿中订单' : activeTab === 'done' ? '暂无已完成订单' : '暂无订单'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              generating={generating}
              loadingStates={loadingStates}
              editContent={editContent[order.id]}
              onConfirmPayment={handleConfirmPayment}
              onGenerate={handleGenerate}
              onUploadFile={handleUploadFile}
              onComplete={requestComplete}
              onDownload={handleDownload}
              onSaveContent={handleSaveContent}
              onDeleteOrder={requestDeleteOrder}
            />
          ))}
        </div>
      )}

      {/* 订单计数 */}
      <div className="mt-4 text-center text-xs text-gray-400">
        共 {displayedOrders.length} 条订单
        {searchQuery && `（搜索过滤自 ${filteredByTab.length} 条）`}
      </div>

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm || (() => {})}
        onCancel={() => setConfirm(prev => ({ ...prev, isOpen: false }))}
        variant="danger"
        confirmLabel="确认"
        cancelLabel="取消"
      />

      {/* 配置面板 */}
      {showConfig && (
        <ConfigPanel password={password} onClose={() => setShowConfig(false)} />
      )}
    </div>
  )
}
