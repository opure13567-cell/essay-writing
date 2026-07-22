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
