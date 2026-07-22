import { createClient } from '@supabase/supabase-js'

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const orderId = url.pathname.split('/').pop()

  const supabaseAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return new Response('订单不存在', { status: 404 })
  }

  let personalInfo = {}
  let title = '我的家风家训调查报告'

  try {
    const qData = JSON.parse(order.description)
    if (qData.personal_info) {
      personalInfo = qData.personal_info
      if (qData.personal_info.title) title = qData.personal_info.title
    }
  } catch {}

  let content = order.edited_content || order.ai_content || ''
  content = cleanMarkdown(content)

  const studentId = personalInfo.student_id || 'unknown'
  const name = personalInfo.name || 'unknown'
  const fileName = `${studentId}${name}.doc`

  const infoParts = []
  if (personalInfo.name) infoParts.push(personalInfo.name)
  if (personalInfo.school) infoParts.push(personalInfo.school)
  if (personalInfo.hometown) infoParts.push(personalInfo.hometown)
  if (personalInfo.major) infoParts.push(personalInfo.major)
  if (personalInfo.grade) infoParts.push(personalInfo.grade)
  if (personalInfo.student_id) infoParts.push(personalInfo.student_id)

  const paragraphs = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((line) => {
      const isHeading = /^[一二三四五六七八九十]、/.test(line) ||
        /^(摘要|关键词|附录|引言|结语|参考文献)/.test(line)
      if (isHeading) {
        return `<p style="font-family:宋体;font-size:14pt;font-weight:bold;margin-top:12pt;margin-bottom:4pt;line-height:25pt">${line}</p>`
      }
      return `<p style="font-family:宋体;font-size:14pt;text-indent:2em;line-height:25pt;margin:0">${line}</p>`
    })
    .join('\n')

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<style>
@page { margin: 2.5cm; }
body { font-family: 宋体, SimSun; }
</style>
</head>
<body>
<p style="font-family:宋体;font-size:16pt;font-weight:bold;text-align:center;margin-bottom:10pt">${title}</p>
<p style="font-family:宋体;font-size:12pt;text-align:center;margin-bottom:20pt">${infoParts.join('  ·  ')}</p>
${paragraphs}
</body>
</html>`

  return new Response('﻿' + html, {
    headers: {
      'Content-Type': 'application/msword; charset=utf-8',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
    },
  })
}

function cleanMarkdown(text) {
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
