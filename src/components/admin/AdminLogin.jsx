import { useState } from 'react'

export default function AdminLogin({ onLogin, initialPassword }) {
  const [pwd, setPwd] = useState(initialPassword || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onLogin(pwd)
    } catch (err) {
      setError(err.message || '口令错误')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto py-20 px-4">
      <h2 className="text-xl font-bold text-center mb-6">🔐 管理后台</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          placeholder="请输入管理口令"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:border-blue-500"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !pwd.trim()}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? '验证中...' : '登录'}
        </button>
      </form>
    </div>
  )
}
