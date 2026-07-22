import { createClient } from '@supabase/supabase-js'
import { buildPrompt as buildFamilyPrompt } from '../../../api/lib/templates/family-tradition.js'
import { buildPrompt as buildHometownPrompt } from '../../../api/lib/templates/hometown-change.js'
import { buildPrompt as buildIndustryPrompt } from '../../../api/lib/templates/industry-interview.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

export async function onRequest(context) {
  const { request, env } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (request.method !== 'POST') {
    return json({ error: '只支持POST' }, 405)
  }

  const url = new URL(request.url)
  const path = url.pathname.replace('/api/admin', '')

  const body = await request.json()
  const { password, ...rest } = body

  const supabaseAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const adminPassword = env.ADMIN_PASSWORD || 'admin123'
  const deepseekApiKey = env.DEEPSEEK_API_KEY

  try {
    switch (path) {
      case '/auth':
        return json(await handleAuth(password, adminPassword))
      case '/orders':
        return json(await handleListOrders(supabaseAdmin, password, adminPassword))
      case '/confirm-payment':
        return json(await handleConfirmPayment(supabaseAdmin, password, adminPassword, rest.orderId, deepseekApiKey))
      case '/generate':
        return json(await handleGenerate(supabaseAdmin, password, adminPassword, rest.orderId, deepseekApiKey))
      case '/edit-content':
        return json(await handleEditContent(supabaseAdmin, password, adminPassword, rest.orderId, rest.content))
      case '/complete':
        return json(await handleComplete(supabaseAdmin, password, adminPassword, rest.orderId))
      case '/config':
        return json(await handleGetConfig(supabaseAdmin, password, adminPassword))
      case '/config/update':
        return json(await handleUpdateConfig(supabaseAdmin, password, adminPassword, rest.config))
      default:
        return json({ error: '接口不存在' }, 404)
    }
  } catch (err) {
    console.error('Admin API Error:', err)
    return json({ error: err.message || '服务器内部错误' }, 500)
  }
}

function mustAuth(password, adminPassword) {
  if (password !== adminPassword) {
    throw new Error('口令错误')
  }
}

async function handleAuth(password, adminPassword) {
  mustAuth(password, adminPassword)
  return { success: true, token: password }
}

async function handleListOrders(supabaseAdmin, password, adminPassword) {
  mustAuth(password, adminPassword)
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error('查询失败')
  return data
}

async function handleConfirmPayment(supabaseAdmin, password, adminPassword, orderId, deepseekApiKey) {
  mustAuth(password, adminPassword)

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'writing' })
    .eq('id', orderId)
    .eq('status', 'paid')

  if (updateError) throw new Error('确认失败')

  // 自动触发AI生成
  try {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (order && deepseekApiKey) {
      const content = await generateEssay(order, deepseekApiKey)
      await supabaseAdmin
        .from('orders')
        .update({ ai_content: content })
        .eq('id', orderId)
    }
  } catch (genErr) {
    console.error('AI auto-generate error:', genErr)
  }

  return { success: true, auto_generated: true }
}

async function handleGenerate(supabaseAdmin, password, adminPassword, orderId, deepseekApiKey) {
  mustAuth(password, adminPassword)

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) throw new Error('订单不存在')
  if (!deepseekApiKey) throw new Error('DeepSeek API密钥未配置')

  const content = await generateEssay(order, deepseekApiKey)

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ ai_content: content })
    .eq('id', orderId)

  if (error) throw new Error('保存失败')
  return { content }
}

async function handleEditContent(supabaseAdmin, password, adminPassword, orderId, content) {
  mustAuth(password, adminPassword)
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ edited_content: content })
    .eq('id', orderId)
  if (error) throw new Error('保存失败')
  return { success: true }
}

async function handleComplete(supabaseAdmin, password, adminPassword, orderId) {
  mustAuth(password, adminPassword)
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('edited_content, ai_content')
    .eq('id', orderId)
    .single()

  const finalContent = order?.edited_content || order?.ai_content || ''
  if (!finalContent.trim()) throw new Error('请先生成内容再发稿')

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'done', edited_content: finalContent })
    .eq('id', orderId)

  if (error) throw new Error('发稿失败')
  return { success: true }
}

async function handleGetConfig(supabaseAdmin, password, adminPassword) {
  mustAuth(password, adminPassword)
  const { data, error } = await supabaseAdmin.from('config').select('*')
  if (error) throw new Error('获取配置失败')
  const config = {}
  data.forEach(row => { config[row.key] = row.value })
  return config
}

async function handleUpdateConfig(supabaseAdmin, password, adminPassword, config) {
  mustAuth(password, adminPassword)
  for (const [key, value] of Object.entries(config)) {
    await supabaseAdmin.from('config').upsert({ key, value }, { onConflict: 'key' })
  }
  return { success: true }
}

async function generateEssay(order, apiKey) {
  let prompt
  try {
    const qData = JSON.parse(order.description)
    if (qData.assignment_type === 'family_tradition') {
      prompt = buildFamilyPrompt(qData)
    } else if (qData.assignment_type === 'hometown_change') {
      prompt = buildHometownPrompt(qData)
    } else if (qData.assignment_type === 'industry_interview') {
      prompt = buildIndustryPrompt(qData)
    }
  } catch {}

  if (!prompt) {
    prompt = `你是一名大学本科生。请根据以下要求写一篇文章。

重要要求：
1. 不要使用"首先其次最后"、"综上所述"、"值得注意的是"等AI常用套话
2. 句式长短交错，偶尔用口语化的短句
3. 保持自然的学术+生活混杂风格
4. 不要用分点列举，用自然段落

以下是作业要求：
${order.description}`
  }

  const res = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 10000,
      temperature: 0.9,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`DeepSeek调用失败: ${res.status} ${errText}`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
