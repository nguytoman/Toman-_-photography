import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LangToggle from './LangToggle'

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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  return (
    <li>
      <NavLink
        to={to}
        style={({ isActive }) => ({
          fontFamily: 'var(--font-display)',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          padding: '0.4rem 0.9rem',
          textDecoration: 'none',
          color: isActive ? 'var(--accent)' : 'var(--text-dim)',
          borderBottom: isActive ? '1px solid var(--accent)' : '1px solid transparent',
          transition: 'color var(--ease), border-color var(--ease)',
        })}
      >
        {label}
      </NavLink>
    </li>
  )
}

export default function Navbar() {
  const { t } = useTranslation()

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        <Link to="/" style={S.logo}>
          <span style={S.logoPrefix}>//</span>
          TOMAN
        </Link>

        <ul style={S.links}>
          <NavItem to="/"        label={t('nav.home')} />
          <NavItem to="/gallery" label={t('nav.gallery')} />
          <NavItem to="/about"   label={t('nav.about')} />
          <NavItem to="/admin"   label={t('nav.admin')} />
        </ul>

        <div style={S.right}>
          <LangToggle />
        </div>
      </div>
    </nav>
  )
}
