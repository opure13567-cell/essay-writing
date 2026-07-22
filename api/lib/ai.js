const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

export async function generateEssay(order, template) {
  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) {
    throw new Error('AI API密钥未配置')
  }

  const typeMap = {
    'essay': '课程论文',
    'report': '实验/实习报告',
    'reflection': '读后感',
    'speech': '演讲稿',
    'other': '文章',
  }

  const typeName = typeMap[order.type] || '文章'

  // 填充模板
  let prompt = (template || DEFAULT_TEMPLATE)
    .replace('{{type}}', typeName)
    .replace('{{words}}', String(order.word_count))
    .replace('{{description}}', order.description)

  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: Math.max(order.word_count * 2, 2000),
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`AI调用失败: ${res.status} ${errText}`)
  }

  const data = await res.json()
  const text = data.content
    .filter(c => c.type === 'text')
    .map(c => c.text)
    .join('\n')

  return text
}

const DEFAULT_TEMPLATE = `你是一名大学本科生，写作水平中等偏上。请根据以下要求写一篇{{type}}，字数约{{words}}字。

重要要求：
1. 不要使用"首先其次最后"、"综上所述"、"值得注意的是"、"不可否认"、"随着...的发展"等AI常用套话
2. 句式长短交错，偶尔用口语化的短句，像真人学生写的
3. 适当加入一个不完美但合理的表达（如轻微的重复、口语化转折）
4. 保持自然的学术+生活混杂风格，不要太工整
5. 不要用分点列举，用自然段落

以下是作业要求：
{{description}}`

export { DEFAULT_TEMPLATE }
