// api/orders.js
import { supabaseAdmin } from './lib/supabase.js'

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Token, X-User-Name, X-User-Student-Id')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const userToken = req.headers['x-user-token']
  if (!userToken) {
    return res.status(400).json({ error: '缺少用户标识' })
  }
  const userName = req.headers['x-user-name'] || ''
  const userStudentId = req.headers['x-user-student-id'] || ''

  // 路由解析：/api/orders 或 /api/orders/:id 或 /api/orders/:id/payment
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathParts = url.pathname.replace('/api/orders', '').split('/').filter(Boolean)

  try {
    if (req.method === 'GET' && pathParts.length === 0) {
      return await listOrders(req, res, userToken, userName, userStudentId)
    }
    if (req.method === 'GET' && pathParts.length === 1) {
      return await getOrder(req, res, userToken, userName, userStudentId, pathParts[0])
    }
    if (req.method === 'POST' && pathParts.length === 0) {
      return await createOrder(req, res, userToken)
    }
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'payment') {
      return await uploadPayment(req, res, userToken, pathParts[0])
    }
    if (req.method === 'PATCH' && pathParts.length === 1) {
      return await uploadPayment(req, res, userToken, pathParts[0])
    }
    return res.status(404).json({ error: '接口不存在' })
  } catch (err) {
    console.error('API Error:', err)
    return res.status(500).json({ error: '服务器内部错误' })
  }
}

async function createOrder(req, res, userToken) {
  const { type, description, screenshots, files, deadline, isRush } = req.body

  if (!description || description.trim() === '') {
    return res.status(400).json({ error: '请填写作业要求' })
  }

  // 统一定价 ¥5
  const price = 5
  const wordCount = 5000

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      user_token: userToken,
      type: type || 'other',
      description: description.trim(),
      screenshots: screenshots || [],
      files: files || [],
      word_count: wordCount,
      price: price,
      status: 'pending_pay',
      deadline: deadline || null,
      is_rush: isRush || false,
    })
    .select()
    .single()

  if (error) {
    console.error('Create order error:', error)
    return res.status(500).json({ error: '创建订单失败' })
  }

  return res.status(201).json(data)
}

async function listOrders(req, res, userToken, userName, userStudentId) {
  const name = esc(userName.trim())
  const studentId = esc(userStudentId.trim())
  const seen = new Map()

  // 1. 本机身份码对应的订单
  const tokenRes = await supabaseAdmin
    .from('orders')
    .select('id, type, word_count, price, status, created_at, is_rush, deadline')
    .eq('user_token', userToken)
    .order('created_at', { ascending: false })

  if (tokenRes.error) {
    console.error('List orders error:', tokenRes.error)
    return res.status(500).json({ error: '获取订单失败' })
  }
  ;(tokenRes.data || []).forEach((o) => seen.set(o.id, o))

  // 2. 按姓名/学号匹配的订单（跨设备也能查到）
  if (name || studentId) {
    const conds = []
    if (name && studentId) {
      conds.push(`and(description.ilike.*"name":"${name}"*,description.ilike.*"student_id":"${studentId}"*)`)
    } else if (name) {
      conds.push(`description.ilike.*"name":"${name}"*`)
    } else {
      conds.push(`description.ilike.*"student_id":"${studentId}"*`)
    }
    const idRes = await supabaseAdmin
      .from('orders')
      .select('id, type, word_count, price, status, created_at, is_rush, deadline')
      .or(conds.join(','))
      .order('created_at', { ascending: false })
    if (!idRes.error) (idRes.data || []).forEach((o) => seen.set(o.id, o))
  }

  const orders = Array.from(seen.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return res.json(orders)
}

async function getOrder(req, res, userToken, userName, userStudentId, orderId) {
  const name = userName.trim()
  const studentId = userStudentId.trim()

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: '订单不存在' })
  }

  const authorized = data.user_token === userToken || matchIdentity(data.description, name, studentId)
  if (!authorized) {
    return res.status(404).json({ error: '订单不存在' })
  }

  delete data.user_token
  return res.json(data)
}

function esc(value) {
  return (value || '').replace(/[%_]/g, '')
}

function matchIdentity(description, name, studentId) {
  try {
    const q = JSON.parse(description)
    const info = q?.personal_info || {}
    if (name && studentId) {
      return String(info.name || '') === name && String(info.student_id || '') === studentId
    }
    if (name) return String(info.name || '') === name
    if (studentId) return String(info.student_id || '') === studentId
  } catch {}
  return false
}

async function uploadPayment(req, res, userToken, orderId) {
  // 检查订单是否属于当前用户
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, status, user_token')
    .eq('id', orderId)
    .eq('user_token', userToken)
    .single()

  if (!order) {
    return res.status(404).json({ error: '订单不存在' })
  }

  if (order.status !== 'pending_pay') {
    return res.status(400).json({ error: '订单状态不正确，无法上传付款截图' })
  }

  // 支持两种方式：base64图片数据 或 已上传的文件路径
  const { payment_screenshot, filePath } = req.body
  const screenshot = filePath || payment_screenshot || ''

  if (!screenshot) {
    return res.status(400).json({ error: '请提供付款截图' })
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      payment_screenshot: screenshot,
      status: 'paid',
    })
    .eq('id', orderId)

  if (error) {
    console.error('Upload payment error:', error)
    return res.status(500).json({ error: '上传失败' })
  }

  return res.json({ success: true, status: 'paid' })
}
