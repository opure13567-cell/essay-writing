export function verifyAdmin(req) {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  return token === password
}
