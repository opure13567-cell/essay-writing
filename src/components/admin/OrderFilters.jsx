import { STATUS_TABS } from '../../utils/admin'

export default function OrderFilters({ activeTab, onTabChange, searchQuery, onSearchChange, paidCount }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      {/* 标签页 */}
      <div className="flex gap-2 overflow-x-auto flex-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {tab.key === 'paid' && paidCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {paidCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 搜索框 */}
      <input
        type="text"
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="🔍 搜索订单ID/类型/描述..."
        className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
    </div>
  )
}
