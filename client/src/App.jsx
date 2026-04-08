import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'

const Home    = lazy(() => import('./pages/Home'))
const Gallery = lazy(() => import('./pages/Gallery'))
const About      = lazy(() => import('./pages/About'))
const Webdesign  = lazy(() => import('./pages/Webdesign'))
const Contact = lazy(() => import('./pages/Contact'))
const Admin   = lazy(() => import('./pages/Admin'))

function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - var(--nav-h))',
        fontFamily: 'var(--font-display)',
        fontSize: '0.6rem',
        letterSpacing: '0.25em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ color: 'var(--accent)' }}>▶</span>&nbsp;LOADING
    </div>
  )
}

function AdminCornerLink() {
  return (
    <Link
      to="/admin"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 50,
        background: 'none',
        border: '1px solid var(--border-2)',
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-display)',
        fontSize: '0.58rem',
        letterSpacing: '0.2em',
        padding: '0.3rem 0.8rem',
        textTransform: 'uppercase',
        textDecoration: 'none',
        transition: 'border-color var(--ease), color var(--ease)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-dim)' }}
    >
      ADMIN
    </Link>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about"      element={<About />} />
          <Route path="/webdesign"  element={<Webdesign />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin"   element={<Admin />} />
        </Routes>
      </Suspense>
      <AdminCornerLink />
    </BrowserRouter>
  )
}
