import { toast } from '../../utils/toast'

export default function OrderActions({
  order,
  generating,
  loadingStates,
  onConfirmPayment,
  onGenerate,
  onUploadFile,
  onComplete,
  onDownload,
}) {
  const isLoading = (key) => loadingStates?.[key] || generating?.[order.id]

  return (
    <div className="flex gap-2 flex-wrap">
      {/* 确认收款 */}
      {order.status === 'paid' && (
        <button
          onClick={() => onConfirmPayment(order.id)}
          disabled={isLoading('confirm')}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading('confirm') ? '⏳ 确认中...' : '✅ 确认收款'}
        </button>
      )}

      {/* AI生成 - 仅在没有内容时显示 */}
      {(order.status === 'writing' || order.status === 'paid') && !order.ai_content && !order.edited_content && (
        <button
          onClick={() => onGenerate(order.id)}
          disabled={isLoading('generate')}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading('generate') ? '🤖 生成中...' : '🤖 AI生成'}
        </button>
      )}

      {/* 下载/上传/发稿 */}
      {(order.ai_content || order.edited_content) && order.status !== 'done' && (
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => onDownload(order)}
            className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200"
          >
            📥 下载Word
          </button>

          {order.plagiarism_report ? (
            <span className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg inline-flex items-center gap-1">
              ✅ 修订稿已上传
              <a href={`/api/orders/download/${order.id}`} className="underline ml-1">预览</a>
            </span>
          ) : (
            <label className="px-3 py-2 bg-yellow-100 text-yellow-700 text-sm rounded-lg hover:bg-yellow-200 cursor-pointer">
              {isLoading('upload') ? '⏳ 上传中...' : '📤 上传修改稿'}
              <input
                type="file"
                accept=".docx,.doc"
                className="hidden"
                disabled={isLoading('upload')}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  e.target.value = ''
                  await onUploadFile(order.id, file)
                }}
              />
            </label>
          )}

          <button
            onClick={() => onComplete(order.id)}
            disabled={isLoading('publish')}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading('publish') ? '⏳ 发稿中...' : '📤 发稿'}
          </button>
        </div>
      )}

      {/* 已发稿 */}
      {order.status === 'done' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-green-600">✅ 已发稿</span>
          {order.plagiarism_report ? (
            <>
              <span className="text-xs text-gray-500">(修订稿)</span>
              <a href={`/api/orders/download/${order.id}`} className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200">
                📄 查看修订稿
              </a>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-500">(原始稿)</span>
              <button onClick={() => onDownload(order)} className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200">
                📥 下载原始稿
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
