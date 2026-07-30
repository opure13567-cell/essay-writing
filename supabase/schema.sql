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
  plagiarism_report TEXT DEFAULT '',    -- 管理员上传的修改稿文件URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  is_rush BOOLEAN DEFAULT FALSE
);

-- 补加字段（如果表已存在）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS plagiarism_report TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_orders_user_token ON orders(user_token);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
