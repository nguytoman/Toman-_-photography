import { useTranslation } from 'react-i18next'

export default function LangToggle() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage || 'cs'

  const toggle = (lang) => {
    if (lang !== current) i18n.changeLanguage(lang)
  }

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {['cs', 'en'].map((lang) => (
        <button
          key={lang}
          onClick={() => toggle(lang)}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.58rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '0.3rem 0.6rem',
            border: '1px solid',
            borderColor: lang === current ? 'var(--accent)' : 'var(--border-2)',
            color: lang === current ? 'var(--accent)' : 'var(--text-dim)',
            background: lang === current ? 'var(--accent-dim)' : 'transparent',
            cursor: 'pointer',
            transition: 'all var(--ease)',
          }}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
