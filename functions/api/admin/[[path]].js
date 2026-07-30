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
        return json(await handleConfirmPayment(context, supabaseAdmin, password, adminPassword, rest.orderId, deepseekApiKey))
      case '/generate':
        return json(await handleGenerate(context, supabaseAdmin, password, adminPassword, rest.orderId, deepseekApiKey))
      case '/get-deepseek-key':
        return json(await handleGetDeepseekKey(password, adminPassword, deepseekApiKey, supabaseAdmin, rest.orderId))
      case '/edit-content':
        return json(await handleEditContent(supabaseAdmin, password, adminPassword, rest.orderId, rest.content))
      case '/complete':
        return json(await handleComplete(supabaseAdmin, password, adminPassword, rest.orderId))
      case '/config':
        return json(await handleGetConfig(supabaseAdmin, password, adminPassword))
      case '/config/update':
        return json(await handleUpdateConfig(supabaseAdmin, password, adminPassword, rest.config))
      case '/order':
        return json(await handleGetOrderContent(supabaseAdmin, password, adminPassword, rest.orderId))
      case '/generate-proxy':
        return json(await handleGenerateProxy(password, adminPassword, deepseekApiKey, rest.prompt))
      case '/upload-file':
        return await handleUploadFile(request, supabaseAdmin, env, password, adminPassword)
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

async function handleUploadFile(request, supabaseAdmin, env, password, adminPassword) {
  mustAuth(password, adminPassword)
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const orderId = formData.get('orderId')
    if (!file || !orderId) return json({ error: '缺少文件或订单ID' }, 400)

    const bytes = await file.arrayBuffer()
    const fileName = `modified_${orderId}_${Date.now()}.docx`

    const { data, error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(fileName, bytes, { contentType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', upsert: true })

    if (error) throw new Error('上传失败: ' + error.message)

    const fileUrl = `${env.VITE_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`

    try {
      await supabaseAdmin.from('orders').update({ plagiarism_report: fileUrl }).eq('id', orderId)
    } catch (dbErr) {
      // 列不存在时忽略（用户未执行ALTER TABLE）
      console.error('Save plagiarism_report failed:', dbErr.message)
    }

    return json({ url: fileUrl })
  } catch (err) {
    return json({ error: err.message }, 500)
  }
}

async function handleListOrders(supabaseAdmin, password, adminPassword) {
  mustAuth(password, adminPassword)
  // 列表返回带内容标记，用于判断是否可发稿
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, user_token, type, word_count, price, status, created_at, deadline, is_rush, description, payment_screenshot, ai_content, edited_content, plagiarism_report')
    .limit(100)
    .limit(100)
    .order('created_at', { ascending: false })
  if (error) throw new Error('查询失败')
  return data
}

async function handleConfirmPayment(context, supabaseAdmin, password, adminPassword, orderId, deepseekApiKey) {
  mustAuth(password, adminPassword)

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'writing' })
    .eq('id', orderId)
    .eq('status', 'paid')

  if (updateError) throw new Error('确认失败')

  // 异步触发AI生成（不阻塞返回，使用waitUntil让后台继续运行）
  context.waitUntil((async () => {
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
  })())

  return { success: true, auto_generated: true }
}

async function handleGenerate(context, supabaseAdmin, password, adminPassword, orderId, deepseekApiKey) {
  mustAuth(password, adminPassword)

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) throw new Error('订单不存在')
  if (!deepseekApiKey) throw new Error('DeepSeek API密钥未配置')

  // 立即返回，后台异步生成
  context.waitUntil((async () => {
    try {
      const content = await generateEssay(order, deepseekApiKey)
      await supabaseAdmin
        .from('orders')
        .update({ ai_content: content })
        .eq('id', orderId)
    } catch (genErr) {
      console.error('AI generate error:', genErr)
    }
  })())

  return { message: 'AI生成已启动，稍后刷新查看结果' }
}


async function handleGenerateProxy(password, adminPassword, deepseekApiKey, prompt) {
  mustAuth(password, adminPassword)
  if (!deepseekApiKey) throw new Error('API密钥未配置')

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${deepseekApiKey}` },
    body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 12000, temperature: 0.9, messages: [{ role: 'user', content: prompt }] }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`DeepSeek失败: ${res.status}`)
  }
  const data = await res.json()
  return { content: data.choices[0]?.message?.content || '' }
}

async function handleGetDeepseekKey(password, adminPassword, deepseekApiKey, supabaseAdmin, orderId) {
  mustAuth(password, adminPassword)
  if (!deepseekApiKey) throw new Error('DeepSeek API密钥未配置')
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()
  if (!order) throw new Error('订单不存在')
  return { apiKey: deepseekApiKey, order }
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

  const hasUpload = order?.plagiarism_report && order.plagiarism_report.trim() !== ''
  const finalContent = order?.edited_content || order?.ai_content || ''

  if (!finalContent.trim() && !hasUpload) {
    throw new Error('请先生成内容或上传修改稿再发稿')
  }

  // 发稿：保留修改稿URL不变，只改状态和文字内容
  const updateData = { status: 'done', edited_content: finalContent }
  if (hasUpload) {
    updateData.plagiarism_report = order.plagiarism_report // 确保修改稿URL不被清掉
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) throw new Error('发稿失败')
  return { success: true, delivered_file: hasUpload ? 'uploaded' : 'original' }
}

async function handleGetOrderContent(supabaseAdmin, password, adminPassword, orderId) {
  mustAuth(password, adminPassword)
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('ai_content, edited_content')
    .eq('id', orderId)
    .single()
  if (error || !data) throw new Error('订单不存在')
  return { ai_content: data.ai_content, edited_content: data.edited_content }
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
      max_tokens: 6000,
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
