import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import Cropper from 'react-easy-crop'
import api from '../api/client'

/* ── Canvas utility ───────────────────────────────────────── */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = url
  })
}

async function getCroppedBlob(imageSrc, pixelCrop, rotation) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)
  ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2)

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
  )

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95))
}

/* ── Aspect ratio presets ─────────────────────────────────── */
const RATIOS = [
  { label: '1:1',    value: 1 },
  { label: '4:3',    value: 4 / 3 },
  { label: '3:2',    value: 3 / 2 },
  { label: '5:3',    value: 5 / 3 },
  { label: '16:9',   value: 16 / 9 },
  { label: '5:4',    value: 5 / 4 },
  { label: '7:5',    value: 7 / 5 },
  { label: '3:1',    value: 3 },
]

/* ── Styles ───────────────────────────────────────────────── */
const labelSt = {
  fontFamily:    'var(--font-display)',
  fontSize:      '0.5rem',
  letterSpacing: '0.18em',
  color:         'var(--text-dim)',
  textTransform: 'uppercase',
  whiteSpace:    'nowrap',
}

/* ── Component ────────────────────────────────────────────── */
export default function PhotoEditor({ filename, hasOriginal, initialParams, onClose, onSaved }) {
  // If photo was previously edited, edit from the saved original
  const src = hasOriginal ? `/originals/${filename}` : `/uploads/${filename}`

  const ip = initialParams || {}
  const [crop, setCrop]               = useState(ip.crop || { x: 0, y: 0 })
  const [zoom, setZoom]               = useState(ip.zoom || 1)
  const [rotation, setRotation]       = useState(ip.rotation || 0)
  const [croppedArea, setCroppedArea] = useState(null)
  const [saving, setSaving]           = useState(false)
  const [ratioIndex, setRatioIndex]   = useState(ip.ratioIndex ?? 0)
  const [portrait, setPortrait]       = useState(ip.portrait || false)

  const [showThirds,   setShowThirds]   = useState(true)
  const [showFineGrid, setShowFineGrid] = useState(false)
  const [showDiagonal, setShowDiagonal] = useState(false)
  const [grayGrid,     setGrayGrid]     = useState(false)
  const [overlayBox,     setOverlayBox]     = useState(null)
  const [containerSize,  setContainerSize]  = useState({ width: 0, height: 0 })
  const [imageAspect,    setImageAspect]    = useState(null)
  const [rotInput,       setRotInput]       = useState('0')

  const containerRef  = useRef()
  const rotFocusedRef = useRef(false)

  // Track container size to compute a fixed crop frame
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const selectedRatio = RATIOS[ratioIndex]
  const aspect = portrait ? 1 / selectedRatio.value : selectedRatio.value

  // Fixed pixel crop size — sized to image width when possible, never changes during rotation
  const cropSize = useMemo(() => {
    const { width: W, height: H } = containerSize
    if (!W || !H) return undefined
    // Rendered image dimensions at zoom=1 (react-easy-crop uses contain fit)
    const renderedW = imageAspect && imageAspect >= W / H ? W        : imageAspect ? H * imageAspect : W
    const renderedH = imageAspect && imageAspect >= W / H ? W / imageAspect : H
    // Prefer fitting crop to image width; fall back to image height if crop would overflow
    const byWidth = { width: renderedW, height: renderedW / aspect }
    if (byWidth.height <= renderedH) {
      return { width: Math.round(byWidth.width), height: Math.round(byWidth.height) }
    }
    return { width: Math.round(renderedH * aspect), height: Math.round(renderedH) }
  }, [containerSize, aspect, imageAspect])

  const updateOverlay = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const cropEl = container.querySelector('[class*="CropArea"]')
    if (!cropEl) return
    const cRect = container.getBoundingClientRect()
    const eRect = cropEl.getBoundingClientRect()
    setOverlayBox({ left: eRect.left - cRect.left, top: eRect.top - cRect.top, width: eRect.width, height: eRect.height })
  }, [])

  useEffect(() => {
    const t = setTimeout(updateOverlay, 100)
    return () => clearTimeout(t)
  }, [crop, zoom, rotation, aspect, updateOverlay])

  // Keep rotation text input in sync when changed externally (slider/buttons)
  useEffect(() => {
    if (!rotFocusedRef.current) setRotInput(String(rotation))
  }, [rotation])

  // Sync rotInput on mount when initialParams provide rotation
  useEffect(() => {
    setRotInput(String(rotation))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleReset = () => {
    setRotation(0)
    setZoom(1)
    setCrop({ x: 0, y: 0 })
  }

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels)
    updateOverlay()
  }, [updateOverlay])

  const save = async () => {
    if (!croppedArea) return
    setSaving(true)
    try {
      const blob = await getCroppedBlob(src, croppedArea, rotation)
      const fd = new FormData()
      fd.append('file', blob, filename.split('/').pop())
      fd.append('filename', filename)
      fd.append('params', JSON.stringify({ crop, zoom, rotation, ratioIndex, portrait }))
      await api.post('/photos/replace', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onSaved()
      onClose()
    } catch {
      alert('Chyba při ukládání')
    } finally {
      setSaving(false)
    }
  }

  const chip = (active, onClick, label) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        background:    'none',
        border:        `1px solid ${active ? 'var(--accent)' : 'var(--border-2)'}`,
        color:         active ? 'var(--accent)' : 'var(--text-dim)',
        fontFamily:    'var(--font-display)',
        fontSize:      '0.52rem',
        letterSpacing: '0.1em',
        padding:       '0.25rem 0.55rem',
        cursor:        'pointer',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: '#080808', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ height: 48, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--accent)' }}>// EDITOVAT FOTKU</div>
          {hasOriginal && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.48rem', letterSpacing: '0.15em', color: '#e5a00d', border: '1px solid #e5a00d', padding: '0.15rem 0.45rem', textTransform: 'uppercase' }}>
              UPRAVENÁ — zobrazuji originál
            </div>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.5rem', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>{filename.split('/').pop()}</div>
      </div>

      {/* Crop area */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          cropSize={cropSize}
          minZoom={1}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onMediaLoaded={(m) => setImageAspect(m.naturalWidth / m.naturalHeight)}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: '#080808' },
            cropAreaStyle:  { border: '1px solid var(--accent)', color: 'rgba(5,5,5,0.55)' },
          }}
        />

        {/* Custom grid overlay */}
        {overlayBox && (showThirds || showFineGrid || showDiagonal) && (
          <svg
            style={{ position: 'absolute', left: overlayBox.left, top: overlayBox.top, width: overlayBox.width, height: overlayBox.height, pointerEvents: 'none', zIndex: 10, overflow: 'visible' }}
          >
            {showThirds && [1, 2].map(i => (
              <g key={i}>
                <line x1={0} y1={overlayBox.height * i / 3} x2={overlayBox.width} y2={overlayBox.height * i / 3} stroke={grayGrid ? 'rgba(120,120,120,0.6)' : 'rgba(255,255,255,0.4)'} strokeWidth={1} />
                <line x1={overlayBox.width * i / 3} y1={0} x2={overlayBox.width * i / 3} y2={overlayBox.height} stroke={grayGrid ? 'rgba(120,120,120,0.6)' : 'rgba(255,255,255,0.4)'} strokeWidth={1} />
              </g>
            ))}
            {showFineGrid && Array.from({ length: 26 }, (_, i) => (
              <g key={i}>
                <line x1={0} y1={overlayBox.height * (i + 1) / 27} x2={overlayBox.width} y2={overlayBox.height * (i + 1) / 27} stroke={grayGrid ? 'rgba(120,120,120,0.35)' : 'rgba(255,255,255,0.18)'} strokeWidth={0.5} />
                <line x1={overlayBox.width * (i + 1) / 27} y1={0} x2={overlayBox.width * (i + 1) / 27} y2={overlayBox.height} stroke={grayGrid ? 'rgba(120,120,120,0.35)' : 'rgba(255,255,255,0.18)'} strokeWidth={0.5} />
              </g>
            ))}
            {showDiagonal && (
              <>
                <line x1={0} y1={0} x2={overlayBox.width} y2={overlayBox.height} stroke={grayGrid ? 'rgba(120,120,120,0.5)' : 'rgba(255,255,255,0.4)'} strokeWidth={1} />
                <line x1={overlayBox.width} y1={0} x2={0} y2={overlayBox.height} stroke={grayGrid ? 'rgba(120,120,120,0.5)' : 'rgba(255,255,255,0.4)'} strokeWidth={1} />
              </>
            )}
          </svg>
        )}
      </div>

      {/* Controls */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '0.85rem 1.5rem', background: 'rgba(8,8,8,0.97)', flexShrink: 0 }}>

        {/* Grid layout: 2 equal columns + auto column for buttons — used across both rows for alignment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', columnGap: '2rem', rowGap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>

          {/* Row 1 col 1 — Aspect ratio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={labelSt}>POMĚR STRAN</span>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
              {RATIOS.map((r, i) => chip(ratioIndex === i, () => setRatioIndex(i), r.label))}
            </div>
            {selectedRatio.value !== 1 && (
              <div style={{ display: 'flex', gap: '2px', marginLeft: '0.5rem' }}>
                {chip(!portrait, () => setPortrait(false), '↔ ŠÍŘKA')}
                {chip(portrait,  () => setPortrait(true),  '↕ VÝŠKA')}
              </div>
            )}
          </div>

          {/* Row 1 col 2 — Grid toggles (aligns with rotation slider) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={labelSt}>MŘÍŽKA</span>
            {chip(showThirds,   () => setShowThirds(v => !v),   'TŘETINY')}
            {chip(showFineGrid, () => setShowFineGrid(v => !v), 'DETAILNÍ')}
            {chip(showDiagonal, () => setShowDiagonal(v => !v), 'DIAGONÁLY')}
            <div style={{ width: '1px', height: '16px', background: 'var(--border-2)', margin: '0 0.25rem' }} />
            {chip(grayGrid, () => setGrayGrid(v => !v), 'TMAVÁ')}
          </div>

          {/* Row 1 col 3 — spacer (matches buttons column width) */}
          <div />

          {/* Row 2 col 1 — Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={labelSt}>ZOOM</span>
            <input type="range" min={1} max={3} step={0.01}
              value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              onDoubleClick={() => setZoom(1)}
              style={{ accentColor: 'var(--accent)', cursor: 'pointer', flex: 1 }}
            />
            <span style={{ ...labelSt, color: 'var(--accent)', minWidth: '2.5rem', textAlign: 'right' }}>{Math.round(zoom * 100)}%</span>
          </div>

          {/* Row 2 col 2 — Rotation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={labelSt}>NÁKLON</span>
            <input type="range" min={-180} max={180} step={1}
              value={rotation}
              onChange={e => setRotation(parseFloat(e.target.value))}
              onDoubleClick={() => setRotation(0)}
              style={{ accentColor: 'var(--accent)', cursor: 'pointer', flex: 1 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', minWidth: '3.5rem', justifyContent: 'flex-end' }}>
              <input
                type="text"
                inputMode="decimal"
                value={rotInput}
                onFocus={() => { rotFocusedRef.current = true; setRotInput(String(rotation)) }}
                onChange={e => setRotInput(e.target.value)}
                onBlur={e => {
                  rotFocusedRef.current = false
                  const v = parseFloat(e.target.value.replace(',', '.'))
                  const clamped = isNaN(v) ? 0 : Math.max(-180, Math.min(180, v))
                  setRotation(clamped)
                  setRotInput(String(clamped))
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const v = parseFloat(e.target.value.replace(',', '.'))
                    const clamped = isNaN(v) ? 0 : Math.max(-180, Math.min(180, v))
                    rotFocusedRef.current = false
                    setRotation(clamped)
                    setRotInput(String(clamped))
                    e.target.blur()
                  }
                  if (e.key === 'Escape') {
                    rotFocusedRef.current = false
                    setRotInput(String(rotation))
                    e.target.blur()
                  }
                }}
                style={{
                  width: '3rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--border-2)',
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.5rem',
                  letterSpacing: '0.18em',
                  textAlign: 'right',
                  outline: 'none',
                  padding: '0.05rem 0.1rem',
                }}
              />
              <span style={{ ...labelSt, color: 'var(--accent)', marginLeft: '1px' }}>°</span>
            </div>
          </div>

          {/* Row 2 col 3 — Rotation buttons */}
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            {chip(false, () => setRotation(r => Math.max(-180, r - 90)), '↺ 90°')}
            {chip(false, () => setRotation(r => Math.min(180, r + 90)), '↻ 90°')}
            {chip(false, handleReset, 'RESET')}
          </div>

        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" style={{ fontSize: '0.52rem', padding: '0.35rem 1rem' }} onClick={onClose}>ZRUŠIT</button>
          <button className="btn" style={{ fontSize: '0.52rem', padding: '0.35rem 1rem' }} onClick={save} disabled={saving}>
            {saving ? 'UKLÁDÁM...' : 'ULOŽIT'}
          </button>
        </div>
      </div>
    </div>
  )
}
