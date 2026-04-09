import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LangToggle from './LangToggle'

const PAGE_NAMES = {
  '/':          'HOME',
  '/gallery':   'PHOTOGRAPHY',
  '/webdesign': 'WEBDESIGN',
  '/about':     'ABOUT',
  '/contact':   'CONTACT',
  '/admin':     'ADMIN',
}

const S = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 'var(--nav-h)',
    background: 'rgba(8, 8, 8, 0.96)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    zIndex: 100,
    backdropFilter: 'blur(12px)',
  },
  inner: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 900,
    fontSize: '0.85rem',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    minWidth: '300px',
  },
  logoPrefix: {
    color: 'var(--text-muted)',
    fontWeight: 400,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    listStyle: 'none',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
}

function NavItem({ to, label }) {
  const [hovered, setHovered] = useState(false)

  return (
    <li>
      <NavLink
        to={to}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={({ isActive }) => ({
          fontFamily: 'var(--font-display)',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          padding: '0.4rem 0.9rem',
          textDecoration: 'none',
          color: isActive || hovered ? 'var(--accent)' : 'var(--text-dim)',
          borderBottom: isActive ? '1px solid var(--accent)' : '1px solid transparent',
          transition: 'color var(--ease)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        })}
      >
        <span style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          color: 'var(--accent)',
        }}>{'['}</span>
        {label}
        <span style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(4px)',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          color: 'var(--accent)',
        }}>{']'}</span>
      </NavLink>
    </li>
  )
}

function LogoTyping() {
  const { pathname } = useLocation()
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    const target = PAGE_NAMES[pathname] || ''
    setDisplayed('')
    if (!target) return
    let i = 0
    let intervalId
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++
        setDisplayed(target.slice(0, i))
        if (i >= target.length) clearInterval(intervalId)
      }, 100)
    }, 400)
    return () => { clearTimeout(timeoutId); clearInterval(intervalId) }
  }, [pathname])

  return (
    <>
      <span>TOMAN{displayed ? <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>&nbsp;{displayed}</span> : ''}<span style={{ animation: 'cursor 1.8s ease-in-out infinite', color: 'var(--text-dim)' }}>_</span></span>
      <style>{`@keyframes cursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </>
  )
}

export default function Navbar() {
  const { t } = useTranslation()

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        <Link to="/" style={S.logo}>
          <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>SHOHAI</span>
          <span style={S.logoPrefix}>//</span>
          <LogoTyping />
        </Link>

        <ul style={{ ...S.links, justifyContent: 'center' }}>
          <NavItem to="/"           label={t('nav.home')} />
          <NavItem to="/gallery"    label={t('nav.gallery')} />
          <NavItem to="/webdesign"  label={t('nav.webdesign')} />
          <NavItem to="/about"      label={t('nav.about')} />
          <NavItem to="/contact"    label={t('nav.contact')} />
        </ul>

        <div style={{ ...S.right, justifyContent: 'flex-end' }}>
          <LangToggle />
        </div>
      </div>
    </nav>
  )
}
