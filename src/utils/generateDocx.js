/**
 * 清理AI生成文本中的markdown标记（前端展示用）
 */
export function cleanMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
}

/**
 * 通过服务端下载 Word 文档（所有平台兼容）
 * 服务端返回带 Content-Disposition 头的文件，浏览器原生下载
 */
export function downloadDocx(order) {
  const url = `/api/orders/download/${order.id}`
  // 使用浏览器原生下载，兼容所有平台（包括iOS Safari）
  window.open(url, '_blank')
}
