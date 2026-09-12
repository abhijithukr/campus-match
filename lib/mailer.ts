const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export async function sendVerificationEmail(to: string, otp: string) {
  const apiKey = process.env.BREVO_API_KEY || ''
  const sender = process.env.BREVO_SENDER_EMAIL || 'projectdentalclinicayarkunnam@gmail.com'
  const html = `
    <div style="font-family:'DM Sans',Arial,sans-serif;background:#faeee7;padding:32px;border-radius:16px;max-width:480px;margin:auto">
      <div style="background:#fffffe;border:1px solid #f8e3db;border-radius:16px;padding:28px">
        <div style="width:48px;height:48px;border-radius:12px;background:#fe019a;display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-weight:800;color:#fff">CM</div>
        <h1 style="color:#33272a;font-size:20px;margin:0 0 8px">Verify your email</h1>
        <p style="color:#594a4e;font-size:14px;line-height:1.6;margin:0 0 20px">Welcome to Love Pic! Use the code below to verify your email address. It expires in 10 minutes.</p>
        <div style="background:#ffc6c7;border-radius:12px;padding:20px;text-align:center;font-size:32px;letter-spacing:8px;font-weight:800;color:#33272a">${otp}</div>
        <p style="color:#594a4e;font-size:12px;line-height:1.6;margin:20px 0 0">If you didn't sign up for Love Pic, you can safely ignore this email.</p>
      </div>
    </div>
  `

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: sender, name: 'Love Pic' },
      to: [{ email: to }],
      subject: 'Your Love Pic verification code',
      htmlContent: html,
      textContent: `Your Love Pic verification code is ${otp}. It expires in 10 minutes.`,
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Brevo API error ${res.status}: ${body.slice(0, 200)}`)
  }

  return res.json()
}
