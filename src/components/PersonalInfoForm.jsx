export default function PersonalInfoForm({ question, value, onChange }) {
  if (question.type === 'select') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {question.label}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">请选择</option>
          {question.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.label}
        {question.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      />
    </div>
  )
}
