const TOKEN_KEY = 'essay_user_token'
const NAME_KEY = 'essay_user_name'
const STUDENT_KEY = 'essay_student_id'

function safeGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

export function getUserToken() {
  let token = safeGet(TOKEN_KEY)
  if (!token) {
    // 生成简单随机token，避免uuid依赖在旧浏览器出问题
    token = 'u' + Date.now() + Math.random().toString(36).slice(2, 10)
    safeSet(TOKEN_KEY, token)
  }
  return token
}

export function getStudentName() {
  return safeGet(NAME_KEY)
}

export function setStudentName(name) {
  safeSet(NAME_KEY, name)
}

export function getStudentId() {
  return safeGet(STUDENT_KEY)
}

export function setStudentId(id) {
  safeSet(STUDENT_KEY, id)
}
