export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: '只支持POST' })

  const { type, price, description, orderId } = req.body

  let info = ''
  try {
    const qData = JSON.parse(description || '{}')
    if (qData.personal_info) {
      info = `${qData.personal_info.name} | ${qData.personal_info.school} | ${qData.personal_info.major}`
    }
  } catch {}

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer re_e7BaiiC6_MPv5w8q1RAzo8GGPuTok46NU',
    },
    body: JSON.stringify({
      from: '写作助手 <onboarding@resend.dev>',
      to: ['opure13567@qq.com'],
      subject: `🔔 新订单！${type || '作业'} - ¥${price}`,
      html: `<h2>新订单通知</h2>
<p><strong>订单编号：</strong>${orderId}</p>
<p><strong>类型：</strong>${type}</p>
<p><strong>金额：</strong>¥${price}</p>
<p><strong>客户信息：</strong>${info}</p>
<p>请前往后台处理：<a href="https://essay-writing-ehl.pages.dev/admin">https://essay-writing-ehl.pages.dev/admin</a></p>`,
    }),
  })

  const result = await r.json()
  console.log('Email sent:', result)
  return res.json({ success: true, id: result.id })
}
