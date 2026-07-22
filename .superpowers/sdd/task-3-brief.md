### Task 3: 后端 API — 学生端订单接口

**文件:**
- 创建: `D:\essay-writing\api\orders.js`

**接口列表:**
- `POST /api/orders` — 创建订单
- `GET /api/orders` — 获取我的订单列表
- `GET /api/orders/:id` — 获取单个订单详情
- `POST /api/orders/:id/payment` — 上传付款截图

**产出:** 学生端4个接口全部可用

- [ ] **Step 1: 实现 api/orders.js**

```js
// api/orders.js
import { supabaseAdmin } from './lib/supabase.js'
import { countWords, calculatePrice } from './lib/pricing.js'

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Token')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const userToken = req.headers['x-user-token']
  if (!userToken) {
    return res.status(400).json({ error: '缺少用户标识' })
  }

  // 路由解析：/api/orders 或 /api/orders/:id 或 /api/orders/:id/payment
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathParts = url.pathname.replace('/api/orders', '').split('/').filter(Boolean)

  try {
    if (req.method === 'GET' && pathParts.length === 0) {
      return await listOrders(req, res, userToken)
    }
    if (req.method === 'GET' && pathParts.length === 1) {
      return await getOrder(req, res, userToken, pathParts[0])
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

  const wordCount = countWords(description)

  // 获取定价规则
  const { data: configRow } = await supabaseAdmin
    .from('config')
    .select('value')
    .eq('key', 'pricing_rules')
    .single()

  const pricingRules = configRow?.value || null
  let price = calculatePrice(wordCount, pricingRules)

  // 封顶30元
  if (price > 30) price = 30

  // 加急 x1.5
  if (isRush) price = Math.min(Math.round(price * 1.5), 30)

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

async function listOrders(req, res, userToken) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, type, word_count, price, status, created_at, is_rush, deadline')
    .eq('user_token', userToken)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('List orders error:', error)
    return res.status(500).json({ error: '获取订单失败' })
  }

  return res.json(data)
}

async function getOrder(req, res, userToken, orderId) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_token', userToken)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: '订单不存在' })
  }

  return res.json(data)
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
```

- [ ] **Step 2: 创建 vercel.json 配置路由**

```json
{
  "rewrites": [
    {
      "source": "/api/orders/:path*",
      "destination": "/api/orders"
    }
  ]
}
```

在 `D:\essay-writing\vercel.json` 创建。

- [ ] **Step 3: 验证**

检查API文件逻辑完整性，确认所有函数签名一致。

---

