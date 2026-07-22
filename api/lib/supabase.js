import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

// 服务端用service_role key（有全部权限）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 前端用anon key（受限，通过RLS控制）
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
