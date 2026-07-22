import { useState } from 'react'
import ChoiceQuestion from './ChoiceQuestion'
import PersonalInfoForm from './PersonalInfoForm'

export default function QuestionFlow({ questionnaire, onComplete }) {
  const allQuestions = questionnaire.stages.flatMap((stage) =>
    stage.questions.map((q) => ({ ...q, stageTitle: stage.title, stageId: stage.id }))
  )

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})

  const totalQuestions = allQuestions.length
  const currentQuestion = allQuestions[currentIdx]
  const progress = Math.round((currentIdx / totalQuestions) * 100)
  const isLast = currentIdx === totalQuestions - 1

  // 检查是否进入新阶段
  const showStageBanner = currentIdx === 0 ||
    allQuestions[currentIdx].stageId !== allQuestions[currentIdx - 1].stageId

  const handleSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (isLast) {
      const personalInfo = {}
      const materialAnswers = {}
      questionnaire.stages.forEach((stage) => {
        stage.questions.forEach((q) => {
          if (stage.id === 'personal_info') {
            personalInfo[q.id] = answers[q.id] || ''
          } else {
            materialAnswers[q.id] = answers[q.id] || ''
          }
        })
      })
      onComplete({
        assignment_type: questionnaire.id,
        personal_info: personalInfo,
        answers: materialAnswers,
      })
      return
    }
    setCurrentIdx((prev) => prev + 1)
  }

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx((prev) => prev - 1)
  }

  const currentValue = answers[currentQuestion.id]
  const canAdvance = currentQuestion.required
    ? currentValue && (typeof currentValue === 'string' ? currentValue.trim() !== '' : true)
    : true

  return (
    <div className="space-y-6">
      {/* 阶段标题 */}
      {showStageBanner && (
        <div className="bg-blue-50 rounded-lg p-3 -mx-1">
          <p className="text-sm font-medium text-blue-800">{currentQuestion.stageTitle}</p>
          <p className="text-xs text-blue-600 mt-0.5">
            {questionnaire.stages.find(s => s.id === currentQuestion.stageId)?.description}
          </p>
        </div>
      )}

      {/* 进度条 */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>第 {currentIdx + 1} 题</span>
          <span>共 {totalQuestions} 题</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 题目内容 */}
      <div className="min-h-[180px]">
        {currentQuestion.type === 'choice' ? (
          <ChoiceQuestion
            question={currentQuestion}
            value={currentValue}
            onSelect={(v) => handleSelect(currentQuestion.id, v)}
          />
        ) : (
          <PersonalInfoForm
            question={currentQuestion}
            value={currentValue}
            onChange={(v) => handleSelect(currentQuestion.id, v)}
          />
        )}
      </div>

      {/* 导航 */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        {currentIdx > 0 && (
          <button
            onClick={handlePrev}
            className="px-5 py-3 text-gray-500 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
          >
            ← 上一题
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
            canAdvance
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLast ? '✓ 提交，开始生成' : '下一题 →'}
        </button>
      </div>
    </div>
  )
}
