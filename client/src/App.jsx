import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

const Home    = lazy(() => import('./pages/Home'))
const Gallery = lazy(() => import('./pages/Gallery'))
const About   = lazy(() => import('./pages/About'))
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

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about"   element={<About />} />
          <Route path="/admin"   element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
