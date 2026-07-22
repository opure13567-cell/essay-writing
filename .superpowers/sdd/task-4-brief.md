### Task 4: 后端 API — 管理后台接口

**文件:**
- 创建: `D:\essay-writing\api\admin.js`
- 创建: `D:\essay-writing\api\lib\ai.js`

**产出:** 管理后台所有接口可用，AI生成功能就绪

- [ ] **Step 1: 创建 AI 调用服务**

```js
// api/lib/ai.js
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

export async function generateEssay(order, template) {
  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) {
    throw new Error('AI API密钥未配置')
  }

  const typeMap = {
    'essay': '课程论文',
    'report': '实验/实习报告',
    'reflection': '读后感',
    'speech': '演讲稿',
    'other': '文章',
  }

  const typeName = typeMap[order.type] || '文章'

  // 填充模板
  let prompt = (template || DEFAULT_TEMPLATE)
    .replace('{{type}}', typeName)
    .replace('{{words}}', String(order.word_count))
    .replace('{{description}}', order.description)

  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: Math.max(order.word_count * 2, 2000),
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`AI调用失败: ${res.status} ${errText}`)
  }

  const data = await res.json()
  const text = data.content
    .filter(c => c.type === 'text')
    .map(c => c.text)
    .join('\n')

  return text
}

const DEFAULT_TEMPLATE = `你是一名大学本科生，写作水平中等偏上。请根据以下要求写一篇{{type}}，字数约{{words}}字。

重要要求：
1. 不要使用"首先其次最后"、"综上所述"、"值得注意的是"、"不可否认"、"随着...的发展"等AI常用套话
2. 句式长短交错，偶尔用口语化的短句，像真人学生写的
3. 适当加入一个不完美但合理的表达（如轻微的重复、口语化转折）
4. 保持自然的学术+生活混杂风格，不要太工整
5. 不要用分点列举，用自然段落

以下是作业要求：
{{description}}`

export { DEFAULT_TEMPLATE }
```

- [ ] **Step 2: 创建管理后台 API**

```js
// api/admin.js
import { supabaseAdmin } from './lib/supabase.js'
import { verifyAdmin } from './lib/auth.js'
import { generateEssay, DEFAULT_TEMPLATE } from './lib/ai.js'

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
        return handleAuth(password)
      case '/orders':
        return handleListOrders(password)
      case '/confirm-payment':
        return handleConfirmPayment(password, rest.orderId)
      case '/generate':
        return handleGenerate(password, rest.orderId)
      case '/edit-content':
        return handleEditContent(password, rest.orderId, rest.content)
      case '/complete':
        return handleComplete(password, rest.orderId)
      case '/config':
        return handleGetConfig(password)
      case '/config/update':
        return handleUpdateConfig(password, rest.config)
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
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'writing' })
    .eq('id', orderId)
    .eq('status', 'paid')

  if (error) throw new Error('确认失败')
  return { success: true }
}

async function handleGenerate(password, orderId) {
  mustAuth(password)
  // 获取订单信息
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) throw new Error('订单不存在')

  // 获取AI模板
  const { data: configRow } = await supabaseAdmin
    .from('config')
    .select('value')
    .eq('key', 'ai_templates')
    .single()

  const templates = configRow?.value || [DEFAULT_TEMPLATE]
  const template = templates[Math.floor(Math.random() * templates.length)]

  // 调用AI生成
  const content = await generateEssay(order, typeof template === 'string' ? template : DEFAULT_TEMPLATE)

  // 保存生成结果
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
```

- [ ] **Step 2: 更新 vercel.json 添加 /api/admin 路由**

```json
{
  "rewrites": [
    {
      "source": "/api/orders/:path*",
      "destination": "/api/orders"
    },
    {
      "source": "/api/admin/:path*",
      "destination": "/api/admin"
    }
  ]
}
```

- [ ] **Step 3: 验证**

确认所有API函数逻辑完整，错误处理完备。

---

