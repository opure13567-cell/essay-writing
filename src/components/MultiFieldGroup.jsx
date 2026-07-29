export default function MultiFieldGroup({ question, values, onChange }) {
  return (
    <div className="space-y-4">
      <p className="text-base font-medium text-gray-800">{question.label}</p>
      <div className="space-y-3">
        {question.fields.map((field) => (
          <div key={field.id} className={field.width === 'half' ? 'w-1/2 pr-1' : 'w-full'}>
            {field.type === 'select' ? (
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">{field.label}</label>
                <select
                  value={values[field.id] || ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm bg-white focus:border-blue-500 outline-none"
                >
                  <option value="">请选择</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">{field.label}</label>
                <input
                  type="text"
                  value={values[field.id] || ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:border-blue-500 outline-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
