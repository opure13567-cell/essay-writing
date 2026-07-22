import { createClient } from '@supabase/supabase-js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-User-Token',
}

export async function onRequest(context) {
  const { request, env } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  const userToken = request.headers.get('x-user-token')
  if (!userToken) {
    return json({ error: '缺少用户标识' }, 400)
  }

  const supabaseAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    const url = new URL(request.url)
    const pathAfterOrders = url.pathname.replace('/api/orders', '')
    const parts = pathAfterOrders.split('/').filter(Boolean)

    if (request.method === 'GET' && parts.length === 0) {
      return await listOrders(supabaseAdmin, userToken)
    }
    if (request.method === 'GET' && parts.length === 1) {
      return await getOrder(supabaseAdmin, userToken, parts[0])
    }
    if (request.method === 'POST' && parts.length === 0) {
      return await createOrder(request, supabaseAdmin, userToken)
    }
    if (request.method === 'POST' && parts.length === 2 && parts[1] === 'payment') {
      return await uploadPayment(request, supabaseAdmin, userToken, parts[0])
    }
    if (request.method === 'PATCH' && parts.length === 1) {
      return await uploadPayment(request, supabaseAdmin, userToken, parts[0])
    }
    return json({ error: '接口不存在' }, 404)
  } catch (err) {
    console.error('API Error:', err)
    return json({ error: '服务器内部错误' }, 500)
  }
}

async function createOrder(request, supabaseAdmin, userToken) {
  const body = await request.json()
  const { type, description, deadline, isRush } = body

  if (!description || description.trim() === '') {
    return json({ error: '请完成问卷后再提交' }, 400)
  }

  const price = 5
  const wordCount = 5000

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      user_token: userToken,
      type: type || 'other',
      description: description.trim(),
      screenshots: [],
      files: [],
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
    return json({ error: '创建订单失败' }, 500)
  }

  // 异步发送邮件通知
  sendEmailNotification({
    type: type || 'other',
    price: price,
    description: description.trim(),
    orderId: data.id,
  })

  return json(data, 201)
}

async function sendEmailNotification({ type, price, description, orderId }) {
  try {
    let info = ''
    try {
      const qData = JSON.parse(description || '{}')
      if (qData.personal_info) {
        info = `${qData.personal_info.name} | ${qData.personal_info.school} | ${qData.personal_info.major}`
      }
    } catch {}

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer re_e7BaiiC6_MPv5w8q1RAzo8GGPuTok46NU',
      },
      body: JSON.stringify({
        from: '写作助手 <onboarding@resend.dev>',
        to: ['opure13567@qq.com'],
        subject: `🔔 新订单！${type} - ¥${price}`,
        html: `<h2>新订单通知</h2>
<p><strong>订单编号：</strong>${orderId}</p>
<p><strong>类型：</strong>${type}</p>
<p><strong>金额：</strong>¥${price}</p>
<p><strong>客户信息：</strong>${info}</p>
<p>请前往后台处理：<a href="https://essay-writing-ehl.pages.dev/admin">https://essay-writing-ehl.pages.dev/admin</a></p>`,
      }),
    })
  } catch (err) {
    console.error('Email notify error:', err)
  }
}

async function listOrders(supabaseAdmin, userToken) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, type, word_count, price, status, created_at, is_rush, deadline')
    .eq('user_token', userToken)
    .order('created_at', { ascending: false })

  if (error) return json({ error: '获取订单失败' }, 500)
  return json(data, 200)
}

async function getOrder(supabaseAdmin, userToken, orderId) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_token', userToken)
    .single()

  if (error || !data) return json({ error: '订单不存在' }, 404)
  return json(data, 200)
}

async function uploadPayment(request, supabaseAdmin, userToken, orderId) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, status, user_token')
    .eq('id', orderId)
    .eq('user_token', userToken)
    .single()

  if (!order) return json({ error: '订单不存在' }, 404)
  if (order.status !== 'pending_pay') return json({ error: '订单状态不正确' }, 400)

  let screenshot = ''
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const body = await request.json()
    screenshot = body.payment_screenshot || body.filePath || ''
  }

  if (!screenshot) return json({ error: '请提供付款截图' }, 400)

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ payment_screenshot: screenshot, status: 'paid' })
    .eq('id', orderId)

  if (error) return json({ error: '上传失败' }, 500)
  return json({ success: true, status: 'paid' }, 200)
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
