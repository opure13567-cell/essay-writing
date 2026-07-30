/**
 * Admin 页面共享工具函数
 */

export const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'paid', label: '待确认' },
  { key: 'writing', label: '写稿中' },
  { key: 'done', label: '已完成' },
]

/** 按状态筛选订单 */
export function filterOrders(orders, tab) {
  if (tab === 'all') return orders
  return orders.filter(o => o.status === tab)
}

/** 搜索订单（客户端过滤） */
export function searchOrders(orders, query) {
  if (!query || !query.trim()) return orders
  const q = query.trim().toLowerCase()
  return orders.filter(o => {
    const idMatch = String(o.id).includes(q)
    const typeMatch = (o.type || '').toLowerCase().includes(q)
    const descMatch = (o.description || '').toLowerCase().includes(q)
    return idMatch || typeMatch || descMatch
  })
}

/** 格式化订单元数据文本 */
export function formatOrderMeta(order) {
  const parts = [
    `${order.word_count}字`,
    order.type === 'family_tradition' ? '家风家训' : order.type === 'hometown_change' ? '家乡变迁' : order.type === 'industry_interview' ? '人物访谈' : order.type,
  ]
  if (order.is_rush) parts.push('⚡加急')
  parts.push(new Date(order.created_at).toLocaleString('zh-CN'))
  return parts.join(' · ')
}

/** 从订单列表计算统计摘要 */
export function computeStats(orders) {
  return {
    total: orders.length,
    paid: orders.filter(o => o.status === 'paid').length,
    writing: orders.filter(o => o.status === 'writing').length,
    done: orders.filter(o => o.status === 'done').length,
    pendingPay: orders.filter(o => o.status === 'pending_pay').length,
  }
}

/** AI 生成提示词构建 */
export function buildAIPrompt(order, customPrompt) {
  if (customPrompt) return customPrompt
  const desc = order?.description || ''
  const wordCount = order?.word_count || 5000

  const TITLES = [
    '守得云开见月明——我的家风家训调查报告',
    '一粥一饭当思来处——记我家的勤俭之风',
    '父亲的工具箱里装着什么——我的家风调查报告',
    '那些年，母亲教我的事——我的家风家训',
    '田埂上的家风——一个普通家庭的传承故事',
    '一盏灯，三代人——我的家风家训调查报告',
    '诚实做人，踏实做事——我的家风家训',
    '把根留住——我的家风家训调查报告',
    '老屋里的家风——我的家风家训',
    '从一块奖章说起——我的家风家训调查报告',
    '家风如雨，润物无声——我的家风家训',
    '一把锄头传三代——我的家风调查报告',
    '饭桌上的规矩——我的家风家训',
    '那些刻在骨子里的话——我的家风家训调查报告',
    '平凡人家的传家宝——我的家风家训',
  ]
  const myTitle = TITLES[Math.floor(Math.random() * TITLES.length)]

  return `你是一名大学本科生。请根据以下素材写一篇《我的家风家训》社会调查报告，字数约${wordCount}字。

标题：${myTitle}（第一行就是标题）

结构：标题 → 摘要+关键词 → 正文（4-6章）→ 附录（访谈提纲）

写作要求：
1. 第一人称"我"，口语化
2. 禁止：首先其次最后、综上所述、值得注意的是、不可否认、随着...的发展、说实话
3. 家训概括成八个字
4. 引用家人话用大白话
5. 结尾不要加任何说明文字
6. 不要出现具体人名、年龄、年级、学校名、地名

素材：
${desc}`
}
