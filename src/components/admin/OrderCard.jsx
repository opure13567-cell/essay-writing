import { formatOrderMeta } from '../../utils/admin'
import StatusBadge from '../StatusBadge'
import OrderActions from './OrderActions'
import ContentEditor from './ContentEditor'

/**
 * 单个订单卡片
 */
export default function OrderCard({
  order,
  generating,
  loadingStates,
  editContent,
  onConfirmPayment,
  onGenerate,
  onUploadFile,
  onComplete,
  onDownload,
  onSaveContent,
}) {
  const borderColor = {
    paid: 'border-l-orange-400',
    writing: 'border-l-purple-400',
    done: 'border-l-green-400',
    pending_pay: 'border-l-gray-300',
  }[order.status] || 'border-l-gray-300'

  return (
    <div className={`border border-gray-200 rounded-lg p-4 space-y-3 border-l-4 ${borderColor}`}>
      {/* 头部：ID + 价格 + 状态 */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-800">#{order.id}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">¥{order.price}</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* 元数据 */}
      <div className="text-xs text-gray-500">
        {formatOrderMeta(order)}
      </div>

      {/* 描述信息 */}
      {order.description && (
        <details className="group">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
            查看订单描述
          </summary>
          <div className="mt-1 bg-gray-50 rounded p-2 text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
            {order.description}
          </div>
        </details>
      )}

      {/* 付款截图 */}
      {order.payment_screenshot && (
        <div>
          <span className="text-xs text-gray-400">付款截图：</span>
          <a
            href={order.payment_screenshot}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-xs text-blue-600 underline"
          >
            点击查看大图
          </a>
          <img
            src={order.payment_screenshot}
            alt="付款截图"
            className="mt-1 rounded border border-gray-300 block max-w-[200px] object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling?.classList.remove('hidden')
            }}
          />
          <span className="hidden text-xs text-red-400 mt-1">
            无法加载预览，请点击上方链接查看
          </span>
        </div>
      )}

      {/* 操作按钮 */}
      <OrderActions
        order={order}
        generating={generating}
        loadingStates={loadingStates}
        onConfirmPayment={onConfirmPayment}
        onGenerate={onGenerate}
        onUploadFile={onUploadFile}
        onComplete={onComplete}
        onDownload={onDownload}
      />

      {/* 内容编辑器 */}
      <ContentEditor
        order={order}
        editContent={editContent}
        onSaveContent={onSaveContent}
      />

      {/* 已发稿显示修改稿链接 */}
      {order.status === 'done' && order.plagiarism_report && (
        <div className="bg-green-50 rounded p-3 text-sm">
          <a href={order.plagiarism_report} target="_blank" rel="noreferrer" className="text-blue-600 underline">
            📄 查看修改稿
          </a>
        </div>
      )}
    </div>
  )
}
