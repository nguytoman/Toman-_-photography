import { useState } from 'react'
import Lightbox from './Lightbox'

export default function PhotoGrid({ photos }) {
  const [active, setActive] = useState(null)

  if (!photos.length) return null

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2px',
        }}
      >
        {photos.map((photo, i) => (
          <PhotoThumb
            key={photo.id}
            photo={photo}
            index={i}
            onClick={() => setActive(i)}
          />
        ))}
      </div>

      {active !== null && (
        <Lightbox
          photos={photos}
          index={active}
          onClose={() => setActive(null)}
          onNavigate={setActive}
        />
      )}
    </>
  )
}

function PhotoThumb({ photo, index, onClick }) {
  const [hovered, setHovered] = useState(false)
  const src = photo.thumb_filename
    ? `/uploads/thumbs/${photo.thumb_filename}`
    : `/uploads/${photo.filename}`

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        aspectRatio: '4/3',
        overflow: 'hidden',
        cursor: 'crosshair',
        background: 'var(--surface)',
      }}
    >
      <img
        src={src}
        alt={photo.title_cs || `Photo ${index + 1}`}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
          transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          filter: hovered ? 'brightness(0.7)' : 'brightness(0.9)',
        }}
      />

      {/* Hover overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: hovered ? '1px solid var(--accent)' : '1px solid transparent',
          transition: 'border-color var(--ease)',
          pointerEvents: 'none',
        }}
      />

      {/* Index badge */}
      <div
        style={{
          position: 'absolute',
          top: '0.5rem',
          left: '0.5rem',
          fontFamily: 'var(--font-display)',
          fontSize: '0.5rem',
          letterSpacing: '0.15em',
          color: 'var(--accent)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity var(--ease)',
          padding: '0.15rem 0.35rem',
          background: 'rgba(8,8,8,0.85)',
        }}
      >
        {String(index + 1).padStart(3, '0')}
      </div>

      {/* Title on hover */}
      {photo.title_cs && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0.5rem 0.75rem',
            background: 'linear-gradient(transparent, rgba(8,8,8,0.9))',
            fontFamily: 'var(--font-display)',
            fontSize: '0.55rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity var(--ease)',
          }}
        >
          {photo.title_cs}
        </div>
      )}
    </div>
  )
}
