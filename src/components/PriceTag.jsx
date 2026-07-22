export default function PriceTag({ price, isRush }) {
  return (
    <div className="text-center py-4">
      <div className="text-4xl font-bold text-blue-600">
        ¥{price}
      </div>
      {isRush && (
        <div className="text-xs text-orange-500 mt-1">含加急费</div>
      )}
      <div className="text-xs text-gray-400 mt-1">付款后24小时内完成</div>
    </div>
  )
}
