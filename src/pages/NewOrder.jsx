import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import QuestionFlow from '../components/QuestionFlow'
import { familyTraditionQuestionnaire } from '../data/questionnaires/family-tradition'
import { hometownChangeQuestionnaire } from '../data/questionnaires/hometown-change'
import { industryInterviewQuestionnaire } from '../data/questionnaires/industry-interview'
import { api } from '../utils/api'

const QUESTIONNAIRES = {
  family_tradition: familyTraditionQuestionnaire,
  hometown_change: hometownChangeQuestionnaire,
  industry_interview: industryInterviewQuestionnaire,
}

export default function NewOrder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const type = searchParams.get('type') || 'family_tradition'
  const questionnaire = QUESTIONNAIRES[type]

  if (!questionnaire) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">未知的作业类型</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 text-sm">
          返回首页
        </button>
      </div>
    )
  }

  const handleComplete = async (questionnaireData) => {
    setLoading(true)
    setError('')
    try {
      const order = await api.createOrder({
        type: questionnaireData.assignment_type,
        description: JSON.stringify(questionnaireData),
      })
      navigate(`/order/${order.id}/pay`)
    } catch (err) {
      setError(err.message || '提交失败，请重试')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-500">正在创建订单...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
          ← 返回
        </button>
        <h2 className="text-lg font-bold text-gray-800">{questionnaire.name}</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm mb-4">{error}</div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <QuestionFlow
          questionnaire={questionnaire}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
