### Task 2: Supabase 数据库 & 工具函数

**文件:**
- 创建: `D:\essay-writing\supabase\schema.sql`
- 创建: `D:\essay-writing\api\lib\supabase.js`
- 创建: `D:\essay-writing\api\lib\auth.js`
- 创建: `D:\essay-writing\api\lib\pricing.js`
- 创建: `D:\essay-writing\src\utils\userToken.js`
- 创建: `D:\essay-writing\src\utils\api.js`

**产出:** 数据库表就绪，后端工具函数可用，前端工具函数可用

- [ ] **Step 1: 在 Supabase 创建项目**

去 https://supabase.com 注册，创建新项目。在SQL Editor中执行以下建表语句：

```sql
-- supabase/schema.sql
-- 订单表
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_token TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  description TEXT NOT NULL DEFAULT '',
  screenshots JSONB DEFAULT '[]',
  files JSONB DEFAULT '[]',
  word_count INTEGER DEFAULT 0,
  price REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_pay',
  payment_screenshot TEXT DEFAULT '',
  ai_content TEXT DEFAULT '',
  edited_content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  is_rush BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_orders_user_token ON orders(user_token);
CREATE INDEX idx_orders_status ON orders(status);

-- 配置表
CREATE TABLE config (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL
);

-- 插入默认配置
INSERT INTO config (key, value) VALUES
  ('pricing_rules', '[
    {"maxWords": 500, "price": 2},
    {"maxWords": 5000, "price": 5},
    {"maxWords": 100000, "price": 10}
  ]'::jsonb),
  ('payment_qr_wechat', '""'),
  ('payment_qr_alipay', '""'),
  ('ai_templates', '[
    "你是一名大学本科生，写作水平中等偏上。请根据以下要求写一篇{{type}}，字数约{{words}}字。注意：1. 不要用\"首先其次最后\"、\"综上所述\"、\"值得注意的是\"等套话；2. 句式长短交错，偶尔用口语化表达；3. 保持自然的学生写作风格，像真人写的。以下是作业要求：\n{{description}}"
  ]'::jsonb);

-- Storage bucket: 创建 uploads bucket 用于存放截图和付款凭证
```

在Supabase控制台 → Storage → 创建新bucket名为 `uploads`，权限设为公开读。

- [ ] **Step 2: 创建 Supabase 服务端客户端**

```js
// api/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

// 服务端用service_role key（有全部权限）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 前端用anon key（受限，通过RLS控制）
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: 创建 admin 口令验证**

```js
// api/lib/auth.js
export function verifyAdmin(req) {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  return token === password
}
```

- [ ] **Step 4: 创建定价计算**

```js
// api/lib/pricing.js
// 默认定价规则
const DEFAULT_RULES = [
  { maxWords: 500, price: 2 },
  { maxWords: 5000, price: 5 },
  { maxWords: 100000, price: 10 },
]

export function calculatePrice(wordCount, pricingRules) {
  const rules = pricingRules || DEFAULT_RULES
  for (const rule of rules) {
    if (wordCount <= rule.maxWords) {
      return rule.price
    }
  }
  return rules[rules.length - 1].price // 超出所有区间取最后一个
}

export function countWords(text) {
  // 中文字数统计：去掉空格和标点的字符数
  const cleaned = text.replace(/[\s\n\r，。！？、；：""''（）《》【】\[\]{}.,!?;:'"()\-\/\\|@#$%^&*+=<>]/g, '')
  return cleaned.length || 0
}
```

- [ ] **Step 5: 创建前端 userToken 工具**

```js
// src/utils/userToken.js
import { v4 as uuidv4 } from 'uuid'

const TOKEN_KEY = 'essay_user_token'

export function getUserToken() {
  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    token = uuidv4()
    localStorage.setItem(TOKEN_KEY, token)
  }
  return token
}
```

- [ ] **Step 6: 创建前端 API 封装**

```js
// src/utils/api.js
import { getUserToken } from './userToken'

const BASE = '/api'

async function request(method, path, body) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': getUserToken(),
    },
  }
  if (body) {
    options.body = JSON.stringify(body)
  }
  const res = await fetch(`${BASE}${path}`, options)
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || '请求失败')
  }
  return data
}

export const api = {
  // 学生端
  createOrder: (data) => request('POST', '/orders', data),
  getOrders: () => request('GET', '/orders'),
  getOrder: (id) => request('GET', `/orders/${id}`),
  uploadPayment: (id, formData) => {
    // formData 包含 payment截图的 File
    return fetch(`${BASE}/orders/${id}/payment`, {
      method: 'POST',
      headers: { 'X-User-Token': getUserToken() },
      body: formData,
    }).then(r => r.json())
  },

  // 管理后台
  adminLogin: (password) => request('POST', '/admin/auth', { password }),
  adminGetOrders: (password) => request('POST', '/admin/orders', { password }),
  adminConfirmPayment: (password, orderId) => request('POST', '/admin/confirm-payment', { password, orderId }),
  adminGenerateAI: (password, orderId) => request('POST', '/admin/generate', { password, orderId }),
  adminEditContent: (password, orderId, content) => request('POST', '/admin/edit-content', { password, orderId, content }),
  adminComplete: (password, orderId) => request('POST', '/admin/complete', { password, orderId }),
  adminGetConfig: (password) => request('POST', '/admin/config', { password }),
  adminUpdateConfig: (password, config) => request('POST', '/admin/config/update', { password, config }),
}
```

- [ ] **Step 7: 验证**

确认所有文件无语法错误（IDE检查即可，暂不运行）。

---

