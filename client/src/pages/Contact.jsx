import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'

export default function Contact() {
  const { t } = useTranslation()
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'ok' | 'error'

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await api.post('/contact', form)
      setStatus('ok')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '2rem' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.55rem',
            letterSpacing: '0.25em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}>
            // CONTACT
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            lineHeight: 1,
          }}>
            {t('contact.title')}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '0 2rem' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          color: 'var(--text-dim)',
          marginBottom: '3rem',
          lineHeight: 1.8,
        }}>
          {t('contact.sub')}
        </p>

        {status === 'ok' ? (
          <div style={{
            border: '1px solid var(--accent)',
            padding: '2rem',
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>SYS:: </span>
            {t('contact.success')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="input-label">{t('contact.name')}</label>
              <input
                className="input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="input-label">{t('contact.email')}</label>
              <input
                className="input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="input-label">{t('contact.message')}</label>
              <textarea
                className="input"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={6}
                style={{ resize: 'vertical' }}
              />
            </div>

            {status === 'error' && (
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: '#c0392b',
              }}>
                {t('contact.error')}
              </div>
            )}

            <div>
              <button type="submit" className="btn" disabled={status === 'sending'}>
                {status === 'sending' ? t('contact.sending') : t('contact.send')}
                <span className="btn-arrow">{'>>'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
