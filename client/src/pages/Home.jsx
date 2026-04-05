import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePhotos, useAlbums } from '../hooks/usePhotos'

export default function Home() {
  const { t } = useTranslation()
  const { photos } = usePhotos()
  const { albums } = useAlbums()

  const featuredPhoto = photos[0]

  return (
    <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          minHeight: 'calc(100vh - var(--nav-h))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background photo */}
        {featuredPhoto && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(/uploads/${featuredPhoto.filename})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.22)',
              zIndex: 0,
            }}
          />
        )}

        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            opacity: featuredPhoto ? 0.3 : 1,
            zIndex: 1,
          }}
        />

        {/* Gradient vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 30%, rgba(8,8,8,0.8) 100%)',
            zIndex: 2,
          }}
        />

        {/* Content */}
        <div
          className="container"
          style={{ position: 'relative', zIndex: 3, padding: '4rem 2rem' }}
        >
          <div style={{ maxWidth: '800px' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.6rem',
                letterSpacing: '0.3em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>SYS::</span>
              {t('home.role').toUpperCase()}
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            </div>

            <h1
              style={{
                fontSize: 'clamp(3rem, 10vw, 7.5rem)',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text)',
                lineHeight: 1,
                marginBottom: '0.25rem',
              }}
            >
              TOMAN
            </h1>

            <h2
              style={{
                fontSize: 'clamp(1rem, 3vw, 2rem)',
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: '2rem',
              }}
            >
              {t('home.tagline')}
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: 300,
                color: 'var(--text-dim)',
                marginBottom: '3rem',
                maxWidth: '50ch',
                lineHeight: 1.8,
              }}
            >
              {t('home.sub')}
            </p>

            <Link to="/gallery" className="btn">
              {t('home.cta')} →
            </Link>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: '1px solid var(--border)',
            background: 'rgba(8, 8, 8, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 3,
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              gap: '0',
              height: '64px',
            }}
          >
            {[
              { value: String(photos.length).padStart(3, '0'), label: t('home.stats.photos') },
              { value: String(albums.length).padStart(2, '0'), label: t('home.stats.albums') },
              { value: '07+', label: t('home.stats.years') },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0 2rem',
                  borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    color: 'var(--accent)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    lineHeight: 1.3,
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </main>
  )
}
