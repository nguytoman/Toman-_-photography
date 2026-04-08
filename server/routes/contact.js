const router     = require('express').Router()
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

router.post('/', async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  try {
    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: 'nguytomas@gmail.com',
      replyTo: email,
      subject: `Poptávka od ${name}`,
      text: `Jméno: ${name}\nE-mail: ${email}\n\n${message}`,
      html: `
        <p><strong>Jméno:</strong> ${name}</p>
        <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr />
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })
    res.json({ ok: true })
  } catch (e) {
    console.error('[contact]', e.message)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

module.exports = router
