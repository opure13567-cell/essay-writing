import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { toast } from '../../utils/toast'

const KNOWN_KEYS = {
  pricing_rules: { label: '定价规则', type: 'json', description: '定价阶梯 JSON' },
  payment_qr_wechat: { label: '微信收款码', type: 'url', description: '微信收款码图片URL' },
  payment_qr_alipay: { label: '支付宝收款码', type: 'url', description: '支付宝收款码图片URL' },
  ai_templates: { label: 'AI 模板', type: 'json', description: 'AI提示词模板数组' },
}

export default function ConfigPanel({ password, onClose }) {
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState({})

  useEffect(() => {
    if (!password) return
    setLoading(true)
    api.adminGetConfig(password)
      .then(data => {
        setConfig(data || {})
        setDirty({})
      })
      .catch(err => toast.error('加载配置失败: ' + err.message))
      .finally(() => setLoading(false))
  }, [password])

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setDirty(prev => ({ ...prev, [key]: true }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // 只保存有修改的字段
      const updates = {}
      Object.keys(dirty).forEach(k => { if (dirty[k]) updates[k] = config[k] })
      await api.adminUpdateConfig(password, updates)
      setDirty({})
      toast.success('配置已更新')
    } catch (err) {
      toast.error('保存失败: ' + err.message)
    }
    setSaving(false)
  }

  const handleSaveKey = async (key) => {
    setSaving(true)
    try {
      await api.adminUpdateConfig(password, { [key]: config[key] })
      setDirty(prev => ({ ...prev, [key]: false }))
      toast.success(`${KNOWN_KEYS[key]?.label || key} 已更新`)
    } catch (err) {
      toast.error('保存失败: ' + err.message)
    }
    setSaving(false)
  }

  const renderField = (key, value) => {
    const meta = KNOWN_KEYS[key]
    const isJson = meta?.type === 'json'
    const isUrl = meta?.type === 'url'

    if (isJson) {
      let display = value
      if (typeof value === 'object') display = JSON.stringify(value, null, 2)
      return (
        <textarea
          value={typeof display === 'string' ? display : ''}
          onChange={e => handleChange(key, e.target.value)}
          rows={6}
          className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono outline-none focus:border-blue-500 resize-y"
        />
      )
    }

    if (isUrl) {
      return (
        <div className="space-y-1">
          <input
            type="text"
            value={value || ''}
            onChange={e => handleChange(key, e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="https://..."
          />
          {value && (
            <img
              src={value}
              alt={KNOWN_KEYS[key]?.label}
              className="h-20 w-20 object-contain border rounded"
              onError={e => { e.target.style.display = 'none' }}
            />
          )}
        </div>
      )
    }

    // 默认文本输入
    return (
      <input
        type="text"
        value={value || ''}
        onChange={e => handleChange(key, e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">⚙️ 系统配置</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : (
          <div className="space-y-4">
            {/* 已知配置项 */}
            {Object.keys(KNOWN_KEYS).map(key => (
              <div key={key} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">{KNOWN_KEYS[key].label}</label>
                  <span className="text-[10px] text-gray-400">{KNOWN_KEYS[key].description}</span>
                </div>
                {renderField(key, config[key])}
                {dirty[key] && (
                  <button
                    onClick={() => handleSaveKey(key)}
                    disabled={saving}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {saving ? '保存中...' : '保存此项'}
                  </button>
                )}
              </div>
            ))}

            {/* 未知配置项 */}
            {Object.keys(config)
              .filter(k => !KNOWN_KEYS[k])
              .map(key => (
                <div key={key} className="border border-gray-100 rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{key}</label>
                  {renderField(key, config[key])}
                </div>
              ))}

            {/* 批量保存 */}
            {Object.keys(dirty).some(k => dirty[k]) && (
              <div className="sticky bottom-0 pt-3 border-t border-gray-100 bg-white">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {saving ? '保存中...' : '💾 保存所有更改'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
