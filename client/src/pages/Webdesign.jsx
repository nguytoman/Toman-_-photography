import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'

function thumbUrl(url) {
  return `https://image.thum.io/get/width/800/crop/500/${url}`
}

function projectImage(project) {
  if (project.logo) return `/uploads/${project.logo}`
  return thumbUrl(project.url)
}

export default function Webdesign() {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || 'cs'
  const [projects, setProjects] = useState([])
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    api.get('/webprojects').then(({ data }) => setProjects(data)).catch(() => {})
  }, [])

  return (
    <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '2rem' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.55rem',
              letterSpacing: '0.25em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}>
              // WEBDESIGN
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
              WEBDESIGN
            </h1>
          </div>

          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.55rem',
            letterSpacing: '0.18em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}>
            <span style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 900, verticalAlign: 'middle' }}>
              {String(projects.length).padStart(2, '0')}
            </span>{' '}
            {lang === 'cs' ? 'WEBŮ' : 'SITES'}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '2px',
      }}>
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(project.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'block',
              textDecoration: 'none',
              outline: 'none',
              position: 'relative',
              overflow: 'visible',
              background: 'var(--surface)',
              border: hovered === project.id ? '1px solid var(--accent)' : '1px solid transparent',
            }}
          >
            {/* Corner accents on card */}
            {hovered !== project.id && [
              { top: -1, left: -1, borderWidth: '2px 0 0 2px' },
              { top: -1, right: -1, borderWidth: '2px 2px 0 0' },
              { bottom: -1, left: -1, borderWidth: '0 0 2px 2px' },
              { bottom: -1, right: -1, borderWidth: '0 2px 2px 0' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 16, height: 16, borderStyle: 'solid', borderColor: 'var(--accent)', zIndex: 2, ...s }} />
            ))}

            {/* Screenshot */}
            <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '8/5' }}>
              <img
                src={projectImage(project)}
                alt={project.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease, filter 0.4s ease',
                  transform: hovered === project.id ? 'scale(1.03)' : 'scale(1)',
                  filter: hovered === project.id ? 'brightness(0.3)' : 'brightness(1)',
                }}
              />

              {/* Open label on hover */}
              {hovered === project.id && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.25em',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                }}>
                  {'>>'} {lang === 'cs' ? 'OTEVŘÍT' : 'OPEN'}
                </div>
              )}
            </div>

            {/* Label bar */}
            <div style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--text)',
                }}>
                  {project.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginTop: '0.2rem',
                }}>
                  {lang === 'cs' ? project.description_cs : project.description_en}
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.62rem',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
              }}>
                {project.url.replace('https://', '')}
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}
