import { supabaseAdmin } from './lib/supabase.js'
import { verifyAdmin } from './lib/auth.js'
import { generateEssay } from './lib/ai.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const url = new URL(req.url, `http://${req.headers.host}`)
  const path = url.pathname.replace('/api/admin', '')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST' })
  }

  const { password, ...rest } = req.body

  try {
    switch (path) {
      case '/auth':
        return res.json(await handleAuth(password))
      case '/orders':
        return res.json(await handleListOrders(password))
      case '/confirm-payment':
        return res.json(await handleConfirmPayment(password, rest.orderId))
      case '/generate':
        return res.json(await handleGenerate(password, rest.orderId))
      case '/edit-content':
        return res.json(await handleEditContent(password, rest.orderId, rest.content))
      case '/complete':
        return res.json(await handleComplete(password, rest.orderId))
      case '/config':
        return res.json(await handleGetConfig(password))
      case '/config/update':
        return res.json(await handleUpdateConfig(password, rest.config))
      default:
        return res.status(404).json({ error: '接口不存在' })
    }
  } catch (err) {
    console.error('Admin API Error:', err)
    return res.status(500).json({ error: err.message || '服务器内部错误' })
  }
}

function mustAuth(password) {
  if (!verifyAdmin({ headers: { authorization: `Bearer ${password}` } })) {
    throw new Error('口令错误')
  }
}

async function handleAuth(password) {
  mustAuth(password)
  return { success: true, token: password }
}

async function handleListOrders(password) {
  mustAuth(password)
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error('查询失败')
  return data
}

async function handleConfirmPayment(password, orderId) {
  mustAuth(password)

  // 1. 更新状态为 writing
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'writing' })
    .eq('id', orderId)
    .eq('status', 'paid')

  if (updateError) throw new Error('确认失败')

  // 2. 自动触发AI生成
  try {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (order) {
      const content = await generateEssay(order)
      await supabaseAdmin
        .from('orders')
        .update({ ai_content: content })
        .eq('id', orderId)
    }
  } catch (genErr) {
    console.error('AI auto-generate error:', genErr)
    // 即使生成失败也返回成功，管理员可手动重试
  }

  return { success: true, auto_generated: true }
}

async function handleGenerate(password, orderId) {
  mustAuth(password)
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) throw new Error('订单不存在')

  // 直接调用 generateEssay，模板由 ai.js 内部选择
  const content = await generateEssay(order)

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ ai_content: content })
    .eq('id', orderId)

  if (error) throw new Error('保存失败')

  return { content }
}

async function handleEditContent(password, orderId, content) {
  mustAuth(password)
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ edited_content: content })
    .eq('id', orderId)

  if (error) throw new Error('保存失败')
  return { success: true }
}

async function handleComplete(password, orderId) {
  mustAuth(password)
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('edited_content, ai_content')
    .eq('id', orderId)
    .single()

  const finalContent = order?.edited_content || order?.ai_content || ''
  if (!finalContent.trim()) throw new Error('请先生成内容再发稿')

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'done',
      edited_content: finalContent,
    })
    .eq('id', orderId)

  if (error) throw new Error('发稿失败')
  return { success: true }
}

async function handleGetConfig(password) {
  mustAuth(password)
  const { data, error } = await supabaseAdmin
    .from('config')
    .select('*')

  if (error) throw new Error('获取配置失败')

  const config = {}
  data.forEach(row => { config[row.key] = row.value })
  return config
}

async function handleUpdateConfig(password, config) {
  mustAuth(password)
  for (const [key, value] of Object.entries(config)) {
    await supabaseAdmin
      .from('config')
      .upsert({ key, value }, { onConflict: 'key' })
  }
  return { success: true }
}
