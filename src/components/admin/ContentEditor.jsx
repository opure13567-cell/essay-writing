import { useState } from 'react'
import { toast } from '../../utils/toast'

/**
 * AI 内容编辑区
 * @param {{ order, editContent, onSaveContent }} props
 */
export default function ContentEditor({ order, editContent, onSaveContent }) {
  const [saving, setSaving] = useState(false)
  const [localContent, setLocalContent] = useState(
    editContent ?? order?.edited_content ?? order?.ai_content ?? ''
  )
  const [hasChanges, setHasChanges] = useState(false)

  // 如果已有修改稿则不显示编辑器
  if (order?.plagiarism_report) return null
  if (!localContent && !order?.ai_content && !order?.edited_content) return null
  if (order?.status === 'done') return null

  const handleChange = (val) => {
    setLocalContent(val)
    setHasChanges(val !== (order?.edited_content ?? order?.ai_content))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSaveContent(order.id, localContent)
      setHasChanges(false)
      toast.success('内容已保存')
    } catch (err) {
      toast.error('保存失败: ' + err.message)
    }
    setSaving(false)
  }

  return (
    <div>
      <textarea
        value={localContent}
        onChange={e => handleChange(e.target.value)}
        rows={10}
        className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 resize-y min-h-[120px]"
        placeholder="AI生成的文章... 在此编辑修改"
      />
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {saving ? '💾 保存中...' : '💾 保存修改'}
        </button>
        {hasChanges && <span className="text-xs text-orange-500">有未保存的修改</span>}
        {!hasChanges && localContent && <span className="text-xs text-green-500">已保存</span>}
      </div>
    </div>
  )
}
