import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrderForm from '../components/OrderForm'
import { api } from '../utils/api'

export default function NewOrder() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const order = await api.createOrder(data)
      navigate(`/order/${order.id}/pay`)
    } catch (err) {
      setError(err.message || '提交失败，请重试')
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">提交作业要求</h2>
      {error && (
        <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm mb-4">{error}</div>
      )}
      <OrderForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
