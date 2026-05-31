import { useState } from 'react'
import { useGame } from '../store.js'
import { logoDataUrl } from './logo.js'
import { LINKS } from '../links.js'
import { GithubIcon, XIcon } from './Icons.jsx'

export default function AuthScreen() {
  const login = useGame((s) => s.login)
  const playAsGuest = useGame((s) => s.playAsGuest)
  const [name, setName] = useState('')

  return (
    <div className="auth-root">
      <div className="auth-bg" />
      <Stars />
      <div className="auth-card">
        <div className="auth-logo-row">
          <img className="auth-logo-mark" src={logoDataUrl()} alt="PixelRex" />
          <h1 className="auth-title">PixelRex</h1>
        </div>
        <div className="auth-tagline">Dino World · Survive the Cretaceous</div>

        <div className="auth-section-title">Enter the realm</div>
        <input
          className="auth-input"
          placeholder="Choose a player name"
          value={name}
          maxLength={18}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') login(name) }}
        />
        {/* This Login button stands in for "Connect Wallet":
            it links an account and grants the same connected-state perks. */}
        <button className="auth-btn primary" onClick={() => login(name)}>
          ▶ Login
        </button>
        <div style={{ fontSize: 10, color: '#6e7a6a', letterSpacing: '.1em', marginTop: 8 }}>
          Logging in links your account &amp; wallet — unlocks PIXA balance, premium dinos and rewards.
        </div>

        <div className="auth-divider">or</div>
        <button className="auth-btn" onClick={playAsGuest}>Play as guest</button>

        <div className="auth-links">
          <a className="auth-link" href={LINKS.x} target="_blank" rel="noreferrer"><XIcon size={13} /> @PixelxRex</a>
          <span className="auth-link-sep">·</span>
          <a className="auth-link" href={LINKS.github} target="_blank" rel="noreferrer"><GithubIcon size={14} /> GitHub</a>
        </div>

        <div className="auth-footer">
          Pixel dino survival · single-player demo build<br />
          v1.0 — original recreation
        </div>
      </div>
    </div>
  )
}

function Stars() {
  // cheap animated starfield using box-shadow dots
  return (
    <svg className="auth-stars" width="100%" height="100%">
      {Array.from({ length: 60 }).map((_, i) => {
        const x = (i * 137.5) % 100
        const y = (i * 53.7) % 100
        const r = (i % 3) * 0.4 + 0.4
        return <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill="#6dbf5a" opacity={0.15 + (i % 5) * 0.08}>
          <animate attributeName="opacity" values={`${0.1};${0.5};${0.1}`} dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />
        </circle>
      })}
    </svg>
  )
}
