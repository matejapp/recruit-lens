import { NavLink, useNavigate } from 'react-router-dom'

export default function Header({ showBack, onBack }) {
  const navigate = useNavigate()

  const handleLogoClick = () => {
    if (onBack) onBack()
    navigate('/')
  }

  return (
    <header className="header">
      <button className="header-logo" onClick={handleLogoClick} aria-label="RecruitLens home">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="var(--text-1)" strokeWidth="1.8" />
          <line x1="3.5" y1="12" x2="20.5" y2="12"
            stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="18.5" y1="18.5" x2="25" y2="25"
            stroke="var(--text-1)" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="9.5" cy="9.5" r="2" fill="rgba(255,255,255,0.12)" />
        </svg>
        RecruitLens
      </button>

      <nav className="header-actions" aria-label="Site navigation">
        <NavLink
          to="/about"
          className={({ isActive }) => `btn-ghost${isActive ? ' btn-ghost--active' : ''}`}
        >
          Research
        </NavLink>

        {showBack && (
          <button className="btn-ghost" onClick={onBack} aria-label="Start new analysis">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            New Analysis
          </button>
        )}
      </nav>
    </header>
  )
}
