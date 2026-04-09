import { useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export default function Lightbox({ photos, index, onClose, onNavigate }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || 'cs'
  const photo = photos[index]

  const prev = useCallback(() => {
    onNavigate(index === 0 ? photos.length - 1 : index - 1)
  }, [index, photos.length, onNavigate])

  const next = useCallback(() => {
    onNavigate(index === photos.length - 1 ? 0 : index + 1)
  }, [index, photos.length, onNavigate])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  if (!photo) return null

  const title = lang === 'cs' ? photo.title_cs : photo.title_en
  const src = `/uploads/previews/${photo.preview || photo.filename}`

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(5, 5, 5, 0.97)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Top bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '48px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            color: 'var(--text-dim)',
          }}
        >
          <span style={{ color: 'var(--accent)' }}>//</span>{' '}
          {t('gallery.photo').toUpperCase()} {String(index + 1).padStart(3, '0')}{' '}
          <span style={{ color: 'var(--text-muted)' }}>{t('gallery.of').toUpperCase()}</span>{' '}
          {String(photos.length).padStart(3, '0')}
        </span>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: '1px solid var(--border-2)',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-display)',
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            padding: '0.3rem 0.8rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all var(--ease)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-dim)' }}
        >
          ESC
        </button>
      </div>

      {/* Side arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); prev() }}
        style={{
          position: 'absolute',
          left: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          opacity: 0.6,
          transition: 'opacity var(--ease)',
          lineHeight: 1,
          padding: '0.5rem',
          zIndex: 10,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6' }}
      >
        <span style={{
          display: 'block',
          width: '22px',
          height: '22px',
          borderTop: '1px solid var(--accent)',
          borderLeft: '1px solid var(--accent)',
          transform: 'rotate(-45deg)',
        }} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); next() }}
        style={{
          position: 'absolute',
          right: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          opacity: 0.6,
          transition: 'opacity var(--ease)',
          lineHeight: 1,
          padding: '0.5rem',
          zIndex: 10,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6' }}
      >
        <span style={{
          display: 'block',
          width: '22px',
          height: '22px',
          borderTop: '1px solid var(--accent)',
          borderRight: '1px solid var(--accent)',
          transform: 'rotate(45deg)',
        }} />
      </button>

      {/* Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 'calc(100vw - 140px)',
          maxHeight: 'calc(100vh - 120px)',
          position: 'relative',
        }}
      >
        <img
          src={src}
          alt={title || ''}
          style={{
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 120px)',
            objectFit: 'contain',
            display: 'block',
          }}
        />

        {/* Corner accents */}
        {[
          { top: 0, left: 0, borderWidth: '1px 0 0 1px' },
          { top: 0, right: 0, borderWidth: '1px 1px 0 0' },
          { bottom: 0, left: 0, borderWidth: '0 0 1px 1px' },
          { bottom: 0, right: 0, borderWidth: '0 1px 1px 0' },
        ].map((style, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 20,
              height: 20,
              borderStyle: 'solid',
              borderColor: 'var(--accent)',
              ...style,
            }}
          />
        ))}
      </div>

      {/* Bottom bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '56px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
        }}
      >
        <button
          onClick={prev}
          style={{
            background: 'none',
            border: '1px solid var(--border-2)',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-display)',
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            padding: '0.4rem 1rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all var(--ease)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-dim)' }}
        >
          ← PREV
        </button>

        <div style={{ textAlign: 'center' }}>
          {title && (
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text)',
              }}
            >
              {title}
            </div>
          )}
          {photo.taken_at && (
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.5rem',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginTop: '0.2rem',
              }}
            >
              {photo.taken_at}
            </div>
          )}
        </div>

        <button
          onClick={next}
          style={{
            background: 'none',
            border: '1px solid var(--border-2)',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-display)',
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            padding: '0.4rem 1rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all var(--ease)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-dim)' }}
        >
          NEXT →
        </button>
      </div>
    </div>
  )
}
