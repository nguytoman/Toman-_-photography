import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { usePhotos, useAlbums } from '../hooks/usePhotos'
import api from '../api/client'

export default function Admin() {
  const { t } = useTranslation()
  const { isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) return <LoginForm onLogin={login} t={t} />
  return <AdminPanel onLogout={logout} t={t} />
}

/* ── Login ─────────────────────────────────────────────────── */
function LoginForm({ onLogin, t }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onLogin(username, password)
    } catch {
      setError(t('admin.loginError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ flex: 1, paddingTop: 'var(--nav-h)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          border: '1px solid var(--border-2)',
          position: 'relative',
        }}
      >
        {/* Corner accents */}
        {[
          { top: -1, left: -1, borderWidth: '2px 0 0 2px' },
          { top: -1, right: -1, borderWidth: '2px 2px 0 0' },
          { bottom: -1, left: -1, borderWidth: '0 0 2px 2px' },
          { bottom: -1, right: -1, borderWidth: '0 2px 2px 0' },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 16,
              height: 16,
              borderStyle: 'solid',
              borderColor: 'var(--accent)',
              ...s,
            }}
          />
        ))}

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
          // {t('admin.login').toUpperCase()}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            marginBottom: '2rem',
          }}
        >
          {t('admin.title')}
        </h1>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="input-label">{t('admin.username')}</label>
            <input
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="input-label">{t('admin.password')}</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: '#e74c3c',
                textTransform: 'uppercase',
              }}
            >
              ⚠ {error}
            </div>
          )}

          <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? '...' : t('admin.loginBtn')}
          </button>
        </form>
      </div>
    </main>
  )
}

/* ── Admin Panel ───────────────────────────────────────────── */
function AdminPanel({ onLogout, t }) {
  const { albums, refetch: refetchAlbums } = useAlbums()
  const { photos, deletePhoto, refetch: refetchPhotos } = usePhotos()
  const [tab, setTab] = useState('upload')

  return (
    <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '2rem',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          maxWidth: '1440px',
          margin: '0 auto',
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
            // {t('admin.title').toUpperCase()}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 3vw, 2.5rem)',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text)',
            }}
          >
            {t('admin.title')}
          </h1>
        </div>
        <button className="btn btn-ghost" onClick={onLogout}>
          {t('admin.logout')}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', padding: '0 2rem' }}>
          {[
            { id: 'upload', label: t('admin.upload') },
            { id: 'photos', label: t('admin.photos') },
            { id: 'albums', label: 'ALBA' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                padding: '1rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
                color: tab === id ? 'var(--accent)' : 'var(--text-dim)',
                cursor: 'pointer',
                transition: 'color var(--ease)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem' }}>
        {tab === 'upload' && (
          <UploadTab albums={albums} onUploaded={refetchPhotos} t={t} />
        )}
        {tab === 'photos' && (
          <PhotosTab photos={photos} albums={albums} onDelete={deletePhoto} t={t} />
        )}
        {tab === 'albums' && (
          <AlbumsTab albums={albums} onCreated={refetchAlbums} t={t} />
        )}
      </div>
    </main>
  )
}

/* ── Upload Tab ────────────────────────────────────────────── */
function UploadTab({ albums, onUploaded, t }) {
  const [files, setFiles] = useState([])
  const [albumId, setAlbumId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const handleFiles = (incoming) => {
    setFiles(Array.from(incoming))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!files.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach((f) => fd.append('photos', f))
      if (albumId) fd.append('album_id', albumId)
      await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setFiles([])
      setAlbumId('')
      onUploaded()
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Dropzone */}
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        style={{
          border: `1px dashed ${dragOver ? 'var(--accent)' : 'var(--border-2)'}`,
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'var(--accent-dim)' : 'var(--surface)',
          transition: 'all var(--ease)',
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: files.length ? 'var(--accent)' : 'var(--text-muted)',
          }}
        >
          {files.length
            ? `${files.length} ${files.length === 1 ? 'soubor' : 'soubory'} vybráno`
            : t('admin.dropzone')}
        </div>
      </div>

      {/* Album select */}
      <div>
        <label className="input-label">{t('admin.album')}</label>
        <select
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-2)',
            color: albumId ? 'var(--text)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            padding: '0.75rem 1rem',
            width: '100%',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">{t('admin.selectAlbum')}</option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>{a.title_cs}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn" disabled={!files.length || uploading}>
        {uploading ? t('admin.uploading') : t('admin.uploadBtn')}
      </button>
    </form>
  )
}

/* ── Photos Tab ────────────────────────────────────────────── */
function PhotosTab({ photos, albums, onDelete, t }) {
  const albumMap = Object.fromEntries(albums.map((a) => [a.id, a.title_cs]))

  if (!photos.length) {
    return (
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          padding: '3rem 0',
        }}
      >
        {t('admin.noPhotos')}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '2px',
      }}
    >
      {photos.map((photo) => (
        <div
          key={photo.id}
          style={{ position: 'relative', background: 'var(--surface)', aspectRatio: '4/3' }}
        >
          <img
            src={photo.thumb_filename ? `/uploads/thumbs/${photo.thumb_filename}` : `/uploads/${photo.filename}`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.7 }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(8,8,8,0.75)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '0.5rem',
              opacity: 0,
              transition: 'opacity var(--ease)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.48rem',
                letterSpacing: '0.12em',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
              }}
            >
              {albumMap[photo.album_id] || '—'}
            </div>
            <button
              className="btn btn-danger"
              style={{ fontSize: '0.5rem', padding: '0.3rem 0.7rem' }}
              onClick={() => {
                if (window.confirm(t('admin.confirmDelete'))) onDelete(photo.id)
              }}
            >
              {t('admin.delete')}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Albums Tab ────────────────────────────────────────────── */
function AlbumsTab({ albums, onCreated, t }) {
  const [titleCs, setTitleCs] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)

  const autoSlug = (val) => val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/albums', { title_cs: titleCs, title_en: titleEn, slug })
      setTitleCs(''); setTitleEn(''); setSlug('')
      onCreated()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'start' }}>
      {/* Create form */}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginBottom: '0.25rem',
          }}
        >
          // {t('admin.newAlbum')}
        </div>
        <div>
          <label className="input-label">{t('admin.albumNameCs')}</label>
          <input
            className="input"
            value={titleCs}
            onChange={(e) => { setTitleCs(e.target.value); setSlug(autoSlug(e.target.value)) }}
            required
          />
        </div>
        <div>
          <label className="input-label">{t('admin.albumNameEn')}</label>
          <input className="input" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required />
        </div>
        <div>
          <label className="input-label">{t('admin.albumSlug')}</label>
          <input className="input" value={slug} onChange={(e) => setSlug(autoSlug(e.target.value))} required />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {t('admin.createAlbum')}
        </button>
      </form>

      {/* Album list */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          // ALBA ({albums.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {albums.map((album) => (
            <div
              key={album.id}
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.12em',
                    color: 'var(--text)',
                    textTransform: 'uppercase',
                  }}
                >
                  {album.title_cs}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.5rem',
                    letterSpacing: '0.12em',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginTop: '0.15rem',
                  }}
                >
                  /{album.slug}
                </div>
              </div>
              <span className="tag">{album.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
