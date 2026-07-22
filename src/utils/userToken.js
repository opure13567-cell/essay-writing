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
