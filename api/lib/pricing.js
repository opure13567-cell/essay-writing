// 默认定价规则
const DEFAULT_RULES = [
  { maxWords: 500, price: 2 },
  { maxWords: 5000, price: 5 },
  { maxWords: 100000, price: 10 },
]

export function calculatePrice(wordCount, pricingRules) {
  const rules = pricingRules || DEFAULT_RULES
  for (const rule of rules) {
    if (wordCount <= rule.maxWords) {
      return rule.price
    }
  }
  return rules[rules.length - 1].price // 超出所有区间取最后一个
}

export function countWords(text) {
  // 中文字数统计：去掉空格和标点的字符数
  const cleaned = text.replace(/[\s\n\r，。！？、；：""''（）《》【】\[\]{}.,!?;:'"()\-\/\\|@#$%^&*+=<>]/g, '')
  return cleaned.length || 0
}
