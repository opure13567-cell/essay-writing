const STATUS_MAP = {
  pending_pay: { label: '待付款', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: '已付款·待确认', color: 'bg-blue-100 text-blue-700' },
  writing: { label: '写稿中', color: 'bg-purple-100 text-purple-700' },
  done: { label: '已完成', color: 'bg-green-100 text-green-700' },
}

export default function StatusBadge({ status }) {
  const info = STATUS_MAP[status] || { label: status, color: 'bg-gray-100' }
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  )
}
