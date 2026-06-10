import express from 'express'
import multer from 'multer'
import nodemailer from 'nodemailer'

// ── Config (from environment) ──────────────────────────────────────────────
// GMAIL_USER         the Gmail address that sends (and receives) the mail
// GMAIL_APP_PASSWORD a 16-char Google "App Password" (NOT the account password;
//                    requires 2-Step Verification enabled on the account)
// SUBMIT_TO          where submissions are delivered (defaults to GMAIL_USER)
// PORT               server port (defaults to 3001)
const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env
const SUBMIT_TO = process.env.SUBMIT_TO || GMAIL_USER
const PORT = process.env.PORT || 3001
const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15 MB

const app = express()
const upload = multer({ limits: { fileSize: MAX_FILE_BYTES } })

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
})

app.post('/api/submit', upload.single('attachment'), async (req, res) => {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('Missing GMAIL_USER / GMAIL_APP_PASSWORD in environment.')
    return res.status(500).json({ success: false, message: 'Server email is not configured.' })
  }

  const { name = '', email = '', message = '' } = req.body
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' })
  }

  const text =
    `New font submission\n\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n\n` +
    `Message:\n${message || '(none)'}\n\n` +
    `Attached file: ${req.file ? req.file.originalname : '(none)'}`

  try {
    await transporter.sendMail({
      from: `ABC Type Foundry <${GMAIL_USER}>`,
      to: SUBMIT_TO,
      replyTo: email,
      subject: `New font submission — ${name}`,
      text,
      attachments: req.file
        ? [{ filename: req.file.originalname, content: req.file.buffer }]
        : [],
    })
    res.json({ success: true })
  } catch (err) {
    console.error('sendMail failed:', err)
    res.status(502).json({ success: false, message: 'Could not send the email.' })
  }
})

app.listen(PORT, () => {
  console.log(`Submit API listening on http://localhost:${PORT}`)
})
