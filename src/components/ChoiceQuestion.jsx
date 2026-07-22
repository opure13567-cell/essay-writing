export default function ChoiceQuestion({ question, value, onSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium text-gray-800">{question.label}</h3>
      <div className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm leading-relaxed ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                  : 'border-gray-150 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
