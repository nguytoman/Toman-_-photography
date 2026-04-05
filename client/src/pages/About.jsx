import { useTranslation } from 'react-i18next'

const CONTACT_ROWS = (t) => [
  { key: t('about.email'),     value: 'foto@toman.cz',    href: 'mailto:foto@toman.cz' },
  { key: t('about.instagram'), value: '@toman.foto',       href: 'https://instagram.com' },
  { key: t('about.location'),  value: t('about.locationValue'), href: null },
]

export default function About() {
  const { t } = useTranslation()

  return (
    <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '2rem' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.55rem',
              letterSpacing: '0.25em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            // {t('about.title')}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text)',
            }}
          >
            {t('about.title')}
          </h1>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '4rem 2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '4rem',
          alignItems: 'start',
        }}
      >
        {/* Bio */}
        <div>
          <SectionLabel>BIO</SectionLabel>

          <div
            style={{
              width: '40px',
              height: '1px',
              background: 'var(--accent)',
              marginBottom: '1.5rem',
            }}
          />

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              fontWeight: 300,
              color: 'var(--text-dim)',
              lineHeight: 1.85,
              marginBottom: '2rem',
              maxWidth: '55ch',
            }}
          >
            {t('about.bio')}
          </p>

          {/* Tech tags */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['Documentary', 'Street', 'Portrait', 'Architecture'].map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <SectionLabel>{t('about.contact').toUpperCase()}</SectionLabel>

          <div
            style={{
              width: '40px',
              height: '1px',
              background: 'var(--accent)',
              marginBottom: '1.5rem',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {CONTACT_ROWS(t).map(({ key, value, href }, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '1rem',
                  padding: '1rem 0',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}
                >
                  {key}
                </span>
                {href ? (
                  <a
                    href={href}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      color: 'var(--accent)',
                      textDecoration: 'none',
                      transition: 'opacity var(--ease)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    {value}
                  </a>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      color: 'var(--text)',
                    }}
                  >
                    {value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.55rem',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: 'var(--accent)',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span style={{ color: 'var(--text-muted)' }}>//</span>
      {children}
    </div>
  )
}
