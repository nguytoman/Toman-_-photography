import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePhotos, useAlbums } from '../hooks/usePhotos'
import PhotoGrid from '../components/PhotoGrid'

export default function Gallery() {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || 'cs'
  const [activeAlbum, setActiveAlbum] = useState(null)
  const { albums } = useAlbums()
  const { photos, loading } = usePhotos(activeAlbum)

  return (
    <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
      {/* Page header */}
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
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
              // {t('gallery.title')}
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text)',
                lineHeight: 1,
              }}
            >
              {t('gallery.title')}
            </h1>
          </div>

          {/* Photo count */}
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.55rem',
              letterSpacing: '0.18em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 900, verticalAlign: 'middle' }}>
              {String(photos.length).padStart(3, '0')}
            </span>{' '}
            {t('gallery.photo').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Album tabs */}
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            padding: '0 2rem',
          }}
        >
          <AlbumTab
            active={activeAlbum === null}
            onClick={() => setActiveAlbum(null)}
            label={t('gallery.all')}
          />
          {albums.map((album) => (
            <AlbumTab
              key={album.id}
              active={activeAlbum === album.id}
              onClick={() => setActiveAlbum(album.id)}
              label={lang === 'cs' ? album.title_cs : album.title_en}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '2px' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40vh',
              fontFamily: 'var(--font-display)',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: 'var(--accent)' }}>▶</span>&nbsp;{t('gallery.loading')}
          </div>
        ) : photos.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40vh',
              fontFamily: 'var(--font-display)',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            {t('gallery.empty')}
          </div>
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </div>
    </main>
  )
}

function AlbumTab({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.58rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        padding: '1rem 1.25rem',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
        color: active ? 'var(--accent)' : 'var(--text-dim)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'color var(--ease), border-color var(--ease)',
      }}
    >
      {label}
    </button>
  )
}
