import { computeStats } from '../../utils/admin'

export default function AdminDashboard({ orders }) {
  const stats = computeStats(orders)

  const cards = [
    { label: '全部订单', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: '待确认', value: stats.paid, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { label: '写稿中', value: stats.writing, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: '已完成', value: stats.done, color: 'bg-green-50 text-green-700 border-green-200' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {cards.map(card => (
        <div key={card.label} className={`rounded-lg border px-3 py-2.5 ${card.color}`}>
          <div className="text-xs opacity-70">{card.label}</div>
          <div className="text-lg font-bold mt-0.5">{card.value}</div>
        </div>
      ))}
    </div>
  )
}
