import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useAlbums } from '../hooks/usePhotos'
import api from '../api/client'
import PhotoEditor from '../components/PhotoEditor'

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
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await onLogin(username, password) }
    catch { setError(t('admin.loginError')) }
    finally { setLoading(false) }
  }

  return (
    <main style={{ flex: 1, paddingTop: 'var(--nav-h)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', border: '1px solid var(--border-2)', position: 'relative' }}>
        {corners()}
        <div style={labelStyle}>// {t('admin.login').toUpperCase()}</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '2rem' }}>
          {t('admin.title')}
        </h1>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div><label className="input-label">{t('admin.username')}</label>
            <input className="input" type="text" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required /></div>
          <div><label className="input-label">{t('admin.password')}</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /></div>
          {error && <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#e74c3c', textTransform: 'uppercase' }}>⚠ {error}</div>}
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
  const [tab, setTab] = useState('upload')
  const [photos, setPhotos] = useState([])
  const [settings, setSettings] = useState({ coverPhoto: null, coverOpacity: 0.78 })

  const [edits, setEdits] = useState({})

  const loadPhotos = () => {
    api.get('/photos').then(({ data }) => setPhotos(data)).catch(() => {})
  }

  const loadEdits = () => {
    api.get('/photos/edits').then(({ data }) => setEdits(data)).catch(() => {})
  }

  const loadSettings = () => {
    api.get('/settings').then(({ data }) => setSettings(data)).catch(() => {})
  }

  const updateSettings = async (patch) => {
    const { data } = await api.patch('/settings', patch)
    setSettings(data)
  }

  useEffect(() => { loadPhotos(); loadSettings(); loadEdits() }, [])

  const deletePhoto = async (filename) => {
    await api.delete('/photos', { data: { filename } })
    setPhotos(prev => prev.filter(p => p.filename !== filename))
  }

  const movePhoto = async (filename, targetFolder) => {
    const { data } = await api.patch('/photos', { filename, targetFolder })
    setPhotos(prev => prev.map(p => p.filename === filename ? { ...p, filename: data.filename, album: targetFolder } : p))
  }

  const revertPhoto = async (filename) => {
    await api.post('/photos/revert', { filename })
    setEdits(prev => { const next = { ...prev }; delete next[filename]; return next })
  }

  const TABS = [
    { id: 'upload',  label: t('admin.upload') },
    { id: 'photos',  label: t('admin.photos') },
    { id: 'folders', label: 'SLOŽKY' },
    { id: 'webs',    label: 'WEBY' },
  ]

  return (
    <main style={{ flex: 1, paddingTop: 'var(--nav-h)' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '2rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', maxWidth: '1440px', margin: '0 auto' }}>
        <div>
          <div style={labelStyle}>// {t('admin.title').toUpperCase()}</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2.5rem)', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)' }}>
            {t('admin.title')}
          </h1>
        </div>
        <button className="btn btn-ghost" onClick={onLogout}>{t('admin.logout')}</button>
      </div>

      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', padding: '0 2rem' }}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '1rem 1.25rem', background: 'none', border: 'none', borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent', color: tab === id ? 'var(--accent)' : 'var(--text-dim)', cursor: 'pointer', transition: 'color var(--ease)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem' }}>
        {tab === 'upload'  && <UploadTab  albums={albums} onUploaded={loadPhotos} t={t} />}
        {tab === 'photos'  && <PhotosTab  photos={photos} albums={albums} onDelete={deletePhoto} onMove={movePhoto} onRevert={revertPhoto} edits={edits} settings={settings} onSettingsChange={updateSettings} t={t} />}
        {tab === 'folders' && <FoldersTab albums={albums} onChanged={refetchAlbums} t={t} />}
        {tab === 'webs'    && <WebsTab />}
      </div>
    </main>
  )
}

/* ── Upload Tab ────────────────────────────────────────────── */
function UploadTab({ albums, onUploaded, t }) {
  const [files, setFiles]     = useState([])
  const [folder, setFolder]   = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const fileRef = useRef()

  const submit = async (e) => {
    e.preventDefault()
    if (!files.length || !folder) return
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('photos', f))
      fd.append('album', folder)
      await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFiles([]); setFolder('')
      onUploaded()
    } finally { setUploading(false) }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); setFiles(Array.from(e.dataTransfer.files)) }}
        style={{ border: `1px dashed ${dragOver ? 'var(--accent)' : 'var(--border-2)'}`, padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'var(--accent-dim)' : 'var(--surface)', transition: 'all var(--ease)' }}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files))} style={{ display: 'none' }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: files.length ? 'var(--accent)' : 'var(--text-muted)' }}>
          {files.length ? `${files.length} ${files.length === 1 ? 'soubor' : 'soubory'} vybráno` : t('admin.dropzone')}
        </div>
      </div>

      <div>
        <label className="input-label">{t('admin.album')}</label>
        <select value={folder} onChange={e => setFolder(e.target.value)} style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', color: folder ? 'var(--text)' : 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', padding: '0.75rem 1rem', width: '100%', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
          <option value="">{t('admin.selectAlbum')}</option>
          {albums.map(a => <option key={a.folder} value={a.folder}>{a.folder}</option>)}
        </select>
      </div>

      <button type="submit" className="btn" disabled={!files.length || !folder || uploading}>
        {uploading ? t('admin.uploading') : t('admin.uploadBtn')}
      </button>
    </form>
  )
}

/* ── Photos Tab ────────────────────────────────────────────── */
function PhotosTab({ photos, albums, onDelete, onMove, onRevert, edits, settings, onSettingsChange, t }) {
  const [movingPhoto, setMovingPhoto] = useState(null)
  const [preview, setPreview]         = useState(null)
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [collapsed, setCollapsed]     = useState({})
  const [selectMode, setSelectMode]   = useState(false)
  const [selected, setSelected]       = useState(new Set())
  const [reorderMode, setReorderMode] = useState(false)
  const [localOrder, setLocalOrder]   = useState(null)
  const [orderDirty, setOrderDirty]   = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)

  const closePreview = () => setPreview(null)

  const toggleSelect = (filename) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(filename) ? next.delete(filename) : next.add(filename)
      return next
    })
  }

  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()) }

  const exitReorderMode = () => { setReorderMode(false); setLocalOrder(null); setOrderDirty(false) }

  const movePhotoInFolder = (folder, idx, dir) => {
    const current = localOrder || photos.map(p => p.filename)
    const folderFiles = current.filter(f => {
      const parts = f.split('/')
      return parts[1] === folder
    })
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= folderFiles.length) return
    const swapped = [...folderFiles]
    ;[swapped[idx], swapped[newIdx]] = [swapped[newIdx], swapped[idx]]
    // rebuild full order replacing this folder's entries
    const otherFiles = current.filter(f => f.split('/')[1] !== folder)
    setLocalOrder([...otherFiles, ...swapped])
    setOrderDirty(true)
  }

  const savePhotoOrder = async (grouped, sortedGroups) => {
    setSavingOrder(true)
    try {
      for (const folder of sortedGroups) {
        const folderPhotos = grouped[folder]
        const order = folderPhotos.map(p => p.filename.split('/').pop())
        await api.put('/photos/order', { folder, order })
      }
      setOrderDirty(false)
      exitReorderMode()
    } finally { setSavingOrder(false) }
  }

  const deleteSelected = async () => {
    if (!window.confirm(`Smazat ${selected.size} fotek?`)) return
    for (const filename of selected) await onDelete(filename)
    exitSelectMode()
  }

  const moveSelected = (folder) => {
    Promise.all([...selected].map(f => onMove(f, folder))).then(() => { setMovingPhoto(null); exitSelectMode() })
  }

  // Group by album folder, preserving album order — must be before useEffect and early return
  const albumOrder = albums.map(a => a.folder)
  const sourcePhotos = localOrder
    ? localOrder.map(fn => photos.find(p => p.filename === fn)).filter(Boolean)
    : photos

  useEffect(() => {
    if (!preview) return
    const handler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closePreview() }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (window.confirm(t('admin.confirmDelete'))) { onDelete(preview); closePreview() }
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const allFiles = sourcePhotos.map(p => p.filename)
        const idx = allFiles.indexOf(preview)
        if (idx === -1) return
        if (e.key === 'ArrowLeft') setPreview(allFiles[(idx - 1 + allFiles.length) % allFiles.length])
        if (e.key === 'ArrowRight') setPreview(allFiles[(idx + 1) % allFiles.length])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [preview, sourcePhotos])

  if (!photos.length) return <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '3rem 0' }}>{t('admin.noPhotos')}</div>

  const grouped = {}  // sourcePhotos and albumOrder defined above
  for (const photo of sourcePhotos) {
    const folder = photo.album || photo.filename.split('/')[1]
    if (!grouped[folder]) grouped[folder] = []
    grouped[folder].push(photo)
  }
  const sortedGroups = [
    ...albumOrder.filter(f => grouped[f]),
    ...Object.keys(grouped).filter(f => !albumOrder.includes(f)),
  ]

  const toggleCollapse = (folder) => setCollapsed(prev => ({ ...prev, [folder]: !prev[folder] }))

  return (
    <div>
      {/* Photo editor */}
      {editingPhoto && (
        <PhotoEditor
          filename={editingPhoto}
          hasOriginal={!!edits[editingPhoto]}
          initialParams={edits[editingPhoto]?.params}
          onClose={() => setEditingPhoto(null)}
          onSaved={() => { setEditingPhoto(null); window.location.reload() }}
        />
      )}

      {/* Preview modal */}
      {preview && (
        <div onClick={closePreview} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(5,5,5,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={`/uploads/${preview}`} alt="" style={{ maxWidth: '90vw', maxHeight: '82vh', objectFit: 'contain', display: 'block' }} onClick={e => e.stopPropagation()} />
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
              {preview.split('/').pop()}
            </div>
            {edits[preview] && (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.48rem', letterSpacing: '0.15em', color: '#e5a00d', border: '1px solid #e5a00d', padding: '0.15rem 0.45rem', textTransform: 'uppercase' }}>
                UPRAVENÁ
              </div>
            )}
          </div>
          <button onClick={closePreview} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: '1px solid var(--border-2)', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '0.5rem', letterSpacing: '0.15em', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>ESC</button>
          <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem', borderColor: settings.coverPhoto === preview ? 'var(--accent)' : undefined, color: settings.coverPhoto === preview ? 'var(--accent)' : undefined }}
              onClick={() => onSettingsChange({ coverPhoto: settings.coverPhoto === preview ? null : preview })}
            >
              {settings.coverPhoto === preview ? '★ ÚVODNÍ FOTKA' : '☆ NASTAVIT JAKO ÚVODNÍ'}
            </button>
            {edits[preview] && (
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem', borderColor: '#e5a00d', color: '#e5a00d' }}
                onClick={async () => {
                  if (!window.confirm('Vrátit fotku do původního stavu?')) return
                  await onRevert(preview)
                  closePreview()
                  window.location.reload()
                }}
              >
                PŮVODNÍ
              </button>
            )}
            <button className="btn btn-ghost" style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem' }} onClick={() => { setEditingPhoto(preview); setPreview(null) }}>EDITOVAT</button>
            <button className="btn btn-ghost" style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem' }} onClick={() => { setMovingPhoto(preview); setPreview(null) }}>PŘESUNOUT</button>
            <button className="btn btn-danger" style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem' }} onClick={() => { if (window.confirm(t('admin.confirmDelete'))) { onDelete(preview); closePreview() } }}>{t('admin.delete')}</button>
          </div>
        </div>
      )}

      {/* Move modal — single or multi */}
      {movingPhoto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(5,5,5,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', padding: '2rem', minWidth: '300px', position: 'relative' }}>
            {corners()}
            <div style={labelStyle}>// PŘESUNOUT {movingPhoto === '__selected__' ? `${selected.size} FOTEK` : 'FOTKU'}</div>
            {movingPhoto !== '__selected__' && (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                {movingPhoto.split('/').pop()}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
              {albums.map(a => (
                <button key={a.folder}
                  onClick={async () => {
                    if (movingPhoto === '__selected__') { moveSelected(a.folder) }
                    else { await onMove(movingPhoto, a.folder); setMovingPhoto(null) }
                  }}
                  style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.6rem 1rem', background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-dim)', cursor: 'pointer', textAlign: 'left', transition: 'border-color var(--ease), color var(--ease)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-dim)' }}
                >
                  {a.folder}
                </button>
              ))}
            </div>
            <button className="btn btn-ghost" onClick={() => setMovingPhoto(null)}>Zrušit</button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {/* Cover photo info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.5rem', letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            ÚVODNÍ FOTKA:
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.5rem', letterSpacing: '0.1em', color: settings.coverPhoto ? 'var(--accent)' : 'var(--text-muted)' }}>
            {settings.coverPhoto ? settings.coverPhoto.split('/').pop() : '— (první fotka)'}
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-2)', flexShrink: 0 }} />

        {/* Opacity slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.5rem', letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            PŘEKRYV:
          </div>
          <input
            type="range" min="0" max="1" step="0.01"
            value={settings.coverOpacity ?? 0.78}
            onChange={e => onSettingsChange({ coverOpacity: parseFloat(e.target.value) })}
            style={{ width: '120px', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'var(--accent)', minWidth: '2.5rem' }}>
            {Math.round((settings.coverOpacity ?? 0.78) * 100)}%
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-2)', flexShrink: 0 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {/* Reorder mode buttons */}
        <button
          className={reorderMode ? 'btn' : 'btn btn-ghost'}
          style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem' }}
          onClick={() => reorderMode ? exitReorderMode() : (setReorderMode(true), setSelectMode(false), setSelected(new Set()))}
        >
          ZMĚNIT POŘADÍ
        </button>
        {reorderMode && orderDirty && (
          <button className="btn" style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem' }} onClick={() => savePhotoOrder(grouped, sortedGroups)} disabled={savingOrder}>
            {savingOrder ? '...' : 'ULOŽIT POŘADÍ'}
          </button>
        )}
        {reorderMode && (
          <button className="btn btn-ghost" style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem' }} onClick={exitReorderMode}>ZRUŠIT</button>
        )}

        {!reorderMode && <div style={{ width: '1px', height: '20px', background: 'var(--border-2)' }} />}

        {/* Select mode buttons */}
        {!reorderMode && (
          <button
            className={selectMode ? 'btn' : 'btn btn-ghost'}
            style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem' }}
            onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
          >
            {selectMode ? `VYBRÁNO: ${selected.size}` : 'VYBRAT VÍCE'}
          </button>
        )}
        {selectMode && selected.size > 0 && (
          <>
            <button className="btn btn-ghost" style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem' }} onClick={() => setMovingPhoto('__selected__')}>PŘESUNOUT VYBRANÉ</button>
            <button className="btn btn-danger" style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem' }} onClick={deleteSelected}>SMAZAT VYBRANÉ</button>
          </>
        )}
        {selectMode && (
          <button className="btn btn-ghost" style={{ fontSize: '0.52rem', padding: '0.35rem 0.9rem' }} onClick={exitSelectMode}>ZRUŠIT</button>
        )}
      </div>

      {/* Grouped sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sortedGroups.map(folder => {
          const folderPhotos = grouped[folder]
          const isCollapsed = collapsed[folder]
          return (
            <div key={folder}>
              {/* Section header */}
              <button
                onClick={() => toggleCollapse(folder)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', borderBottom: '1px solid var(--border)' }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--accent)', textTransform: 'uppercase' }}>
                  // {folder}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.5rem', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {folderPhotos.length} fotek
                </div>
                <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontSize: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                  {isCollapsed ? '▼ ROZBALIT' : '▲ SBALIT'}
                </div>
              </button>

              {/* Photo grid */}
              {!isCollapsed && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '2px', marginTop: '2px' }}>
                  {folderPhotos.map((photo, idx) => {
                    const isSelected = selected.has(photo.filename)
                    const isEdited   = !!edits[photo.filename]
                    return (
                    <div key={photo.filename}
                      style={{ position: 'relative', background: 'var(--surface)', aspectRatio: '4/3', cursor: reorderMode ? 'default' : 'pointer', outline: isSelected ? '2px solid var(--accent)' : 'none', outlineOffset: '-2px' }}
                      onClick={() => !reorderMode && (selectMode ? toggleSelect(photo.filename) : setPreview(photo.filename))}
                    >
                      <img src={`/uploads/${photo.filename}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: reorderMode ? 0.5 : isSelected ? 0.5 : 0.75 }} />
                      {isEdited && !reorderMode && !isSelected && (
                        <div style={{ position: 'absolute', top: '0.35rem', left: '0.35rem', background: 'rgba(229,160,13,0.9)', fontFamily: 'var(--font-display)', fontSize: '0.38rem', letterSpacing: '0.12em', color: '#080808', padding: '0.1rem 0.3rem', textTransform: 'uppercase', fontWeight: 700 }}>UPRAVENO</div>
                      )}
                      {isSelected && !reorderMode && (
                        <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', width: 18, height: 18, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.55rem', color: '#080808', fontWeight: 900 }}>✓</div>
                      )}
                      {reorderMode && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={e => { e.stopPropagation(); movePhotoInFolder(folder, idx, -1) }}
                            disabled={idx === 0}
                            style={{ background: 'rgba(8,8,8,0.85)', border: '1px solid var(--border-2)', color: idx === 0 ? 'var(--text-muted)' : 'var(--accent)', width: 32, height: 32, cursor: idx === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                          >◀</button>
                          <button
                            onClick={e => { e.stopPropagation(); movePhotoInFolder(folder, idx, 1) }}
                            disabled={idx === folderPhotos.length - 1}
                            style={{ background: 'rgba(8,8,8,0.85)', border: '1px solid var(--border-2)', color: idx === folderPhotos.length - 1 ? 'var(--text-muted)' : 'var(--accent)', width: 32, height: 32, cursor: idx === folderPhotos.length - 1 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                          >▶</button>
                        </div>
                      )}
                    </div>
                  )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Folders Tab ───────────────────────────────────────────── */
function FoldersTab({ albums, onChanged }) {
  const [newName, setNewName]       = useState('')
  const [renaming, setRenaming]     = useState(null)
  const [renameVal, setRenameVal]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [localOrder, setLocalOrder] = useState(null)
  const [orderDirty, setOrderDirty] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)

  // Sync localOrder when albums load/change (but not while user is reordering)
  useEffect(() => {
    if (!orderDirty) setLocalOrder(albums.map(a => a.folder))
  }, [albums, orderDirty])

  const orderedAlbums = localOrder
    ? localOrder.map(f => albums.find(a => a.folder === f)).filter(Boolean)
    : albums

  const moveUp = (i) => {
    if (i === 0) return
    const next = [...localOrder]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    setLocalOrder(next); setOrderDirty(true)
  }

  const moveDown = (i) => {
    if (i === localOrder.length - 1) return
    const next = [...localOrder]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    setLocalOrder(next); setOrderDirty(true)
  }

  const saveOrder = async () => {
    setSavingOrder(true)
    try { await api.put('/albums/order', { order: localOrder }); setOrderDirty(false); onChanged() }
    finally { setSavingOrder(false) }
  }

  const createFolder = async (e) => {
    e.preventDefault()
    if (!newName) return
    setLoading(true)
    try { await api.post('/albums', { name: newName }); setNewName(''); setOrderDirty(false); onChanged() }
    finally { setLoading(false) }
  }

  const renameFolder = async (folder) => {
    if (!renameVal || renameVal === folder) return setRenaming(null)
    await api.patch(`/albums/${encodeURIComponent(folder)}`, { name: renameVal })
    setRenaming(null); setOrderDirty(false); onChanged()
  }

  const deleteFolder = async (folder) => {
    if (!window.confirm(`Smazat složku "${folder}" a všechny fotky v ní?`)) return
    await api.delete(`/albums/${encodeURIComponent(folder)}`)
    setOrderDirty(false); onChanged()
  }

  const arrowBtn = { background: 'none', border: '1px solid var(--border-2)', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem 0.4rem', fontFamily: 'var(--font-display)', fontSize: '0.55rem', lineHeight: 1, transition: 'border-color var(--ease), color var(--ease)' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'start' }}>
      <form onSubmit={createFolder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={labelStyle}>// NOVÁ SLOŽKA</div>
        <div>
          <label className="input-label">NÁZEV</label>
          <input className="input" value={newName} onChange={e => setNewName(e.target.value)} required />
        </div>
        <button type="submit" className="btn" disabled={loading}>VYTVOŘIT</button>
      </form>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={labelStyle}>// SLOŽKY ({albums.length})</div>
          {orderDirty && (
            <button className="btn" style={{ fontSize: '0.5rem', padding: '0.3rem 0.8rem' }} onClick={saveOrder} disabled={savingOrder}>
              {savingOrder ? '...' : 'ULOŽIT POŘADÍ'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {orderedAlbums.map((a, i) => (
            <div key={a.folder} style={{ padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button style={{ ...arrowBtn, opacity: i === 0 ? 0.2 : 1 }} onClick={() => moveUp(i)} disabled={i === 0}
                    onMouseEnter={e => { if (i !== 0) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-muted)' }}>▲</button>
                  <button style={{ ...arrowBtn, opacity: i === orderedAlbums.length - 1 ? 0.2 : 1 }} onClick={() => moveDown(i)} disabled={i === orderedAlbums.length - 1}
                    onMouseEnter={e => { if (i !== orderedAlbums.length - 1) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-muted)' }}>▼</button>
                </div>
              </div>

              {renaming === a.folder ? (
                <input className="input" value={renameVal} onChange={e => setRenameVal(e.target.value)} autoFocus style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                  onKeyDown={e => { if (e.key === 'Enter') renameFolder(a.folder); if (e.key === 'Escape') setRenaming(null) }} />
              ) : (
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--text)', textTransform: 'uppercase' }}>{a.folder}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.5rem', letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.15rem' }}>{a.count} fotek</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                {renaming === a.folder ? (
                  <>
                    <button className="btn" style={{ fontSize: '0.48rem', padding: '0.25rem 0.6rem' }} onClick={() => renameFolder(a.folder)}>OK</button>
                    <button className="btn btn-ghost" style={{ fontSize: '0.48rem', padding: '0.25rem 0.6rem' }} onClick={() => setRenaming(null)}>✕</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-ghost" style={{ fontSize: '0.48rem', padding: '0.25rem 0.6rem' }} onClick={() => { setRenaming(a.folder); setRenameVal(a.folder) }}>PŘEJMENOVAT</button>
                    <button className="btn btn-danger" style={{ fontSize: '0.48rem', padding: '0.25rem 0.6rem' }} onClick={() => deleteFolder(a.folder)}>SMAZAT</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Webs Tab ──────────────────────────────────────────────── */
function WebsTab() {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const logoRef = useRef()

  const [form, setForm] = useState({ url: '', name: '', description_cs: '', description_en: '' })

  const loadProjects = () => api.get('/webprojects').then(({ data }) => setProjects(data)).catch(() => {})
  useEffect(() => { loadProjects() }, [])

  const openNew   = () => { setForm({ url: '', name: '', description_cs: '', description_en: '' }); setEditing(null); setShowForm(true) }
  const openEdit  = (p)  => { setForm({ url: p.url, name: p.name, description_cs: p.description_cs, description_en: p.description_en }); setEditing(p.id); setShowForm(true) }

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (logoRef.current?.files[0]) fd.append('logo', logoRef.current.files[0])
      if (editing) await api.patch(`/webprojects/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      else         await api.post('/webprojects', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowForm(false); loadProjects()
    } finally { setLoading(false) }
  }

  const deleteProject = async (id) => {
    if (!window.confirm('Smazat tento web?')) return
    await api.delete(`/webprojects/${id}`)
    loadProjects()
  }

  return (
    <div>
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(5,5,5,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', padding: '2rem', width: '100%', maxWidth: '480px', position: 'relative' }}>
            {corners()}
            <div style={labelStyle}>// {editing ? 'EDITOVAT' : 'PŘIDAT'} WEB</div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div><label className="input-label">URL</label>
                <input className="input" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://example.com" required /></div>
              <div><label className="input-label">NÁZEV</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="input-label">POPIS (CZ)</label>
                <input className="input" value={form.description_cs} onChange={e => setForm(f => ({ ...f, description_cs: e.target.value }))} /></div>
              <div><label className="input-label">POPIS (EN)</label>
                <input className="input" value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} /></div>
              <div><label className="input-label">LOGO (obrázek)</label>
                <input ref={logoRef} type="file" accept="image/*" className="input" style={{ cursor: 'pointer' }} /></div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn" disabled={loading}>{loading ? '...' : 'ULOŽIT'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>ZRUŠIT</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={labelStyle}>// WEBY ({projects.length})</div>
        <button className="btn" onClick={openNew}>+ PŘIDAT WEB</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {projects.map(p => (
          <div key={p.id} style={{ padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {p.logo && <img src={`/uploads/${p.logo}`} alt="" style={{ width: 40, height: 40, objectFit: 'contain', background: 'var(--surface-2)', padding: 4 }} />}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text)', textTransform: 'uppercase' }}>{p.name}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.52rem', letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{p.url}</div>
                {p.description_cs && <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.52rem', letterSpacing: '0.1em', color: 'var(--text-dim)', marginTop: '0.1rem' }}>{p.description_cs}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              <button className="btn btn-ghost" style={{ fontSize: '0.5rem', padding: '0.3rem 0.7rem' }} onClick={() => openEdit(p)}>EDITOVAT</button>
              <button className="btn btn-danger" style={{ fontSize: '0.5rem', padding: '0.3rem 0.7rem' }} onClick={() => deleteProject(p.id)}>SMAZAT</button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '3rem 0' }}>ŽÁDNÉ WEBY</div>}
      </div>
    </div>
  )
}

/* ── Helpers ───────────────────────────────────────────────── */
const labelStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: '0.55rem',
  letterSpacing: '0.25em',
  color: 'var(--accent)',
  textTransform: 'uppercase',
  marginBottom: '0.5rem',
}

function corners() {
  return [
    { top: -1, left: -1, borderWidth: '2px 0 0 2px' },
    { top: -1, right: -1, borderWidth: '2px 2px 0 0' },
    { bottom: -1, left: -1, borderWidth: '0 0 2px 2px' },
    { bottom: -1, right: -1, borderWidth: '0 2px 2px 0' },
  ].map((s, i) => (
    <div key={i} style={{ position: 'absolute', width: 16, height: 16, borderStyle: 'solid', borderColor: 'var(--accent)', ...s }} />
  ))
}
