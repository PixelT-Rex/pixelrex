import { useGame } from '../store.js'
import { logoDataUrl } from './logo.js'
import { itemIcon } from './icons.js'
import { ITEMS } from '../data/items.js'
import { DINO_BY_ID } from '../data/dinos.js'
import Panels from './Panels.jsx'
import Chat from './Chat.jsx'
import { LINKS } from '../links.js'

const fmt = (n) => n.toLocaleString('en-US')

export default function Hud() {
  const s = useGame()
  const dino = DINO_BY_ID[s.species]
  const xpForLevel = 60 * s.level * s.level

  return (
    <div className="hud" id="hud-root">
      {/* top-left brand */}
      <div className="hud-topleft">
        <div className="brand">
          <img src={logoDataUrl()} alt="" />
          <b>PIXELREX</b>
        </div>
        <div className="realm-tag">Cretaceous Valley</div>
      </div>

      {/* top-right stats + account */}
      <div className="hud-topright">
        <div className="stat-pill clickable" onClick={() => s.openPanel('market')} title="Marketplace">
          <span className="stat-label">Gold</span>
          <span className="stat-value">{fmt(s.gold)}</span>
        </div>
        <div className="stat-pill clickable" onClick={() => s.openPanel('rewards')} title="PIXA balance">
          <span className="stat-label">Pixa</span>
          <span className="stat-value" style={{ color: '#c9a96a' }}>{fmt(s.pixa)}</span>
        </div>
        <div className="online-pill">
          <span className="online-dot" />
          <span className="online-count">{s.onlineCount}</span>
          <span>online</span>
        </div>
        {s.loggedIn ? (
          <div className="wallet-pill" onClick={() => s.openPanel('wallet')} title="Account">
            <span className="wallet-dot" />
            {s.account.address.slice(0, 4)}…{s.account.address.slice(-4)}
          </div>
        ) : (
          <div className="wallet-pill guest" onClick={() => s.logout()} title="Login">
            <span className="wallet-dot" />
            Login
          </div>
        )}
        <button className="icon-btn" onClick={() => s.openPanel('help')} title="Help">?</button>
        <button className="icon-btn" onClick={() => s.openPanel('docs')} title="Docs">📖</button>
        <a className="icon-btn link" href={LINKS.x} target="_blank" rel="noreferrer" title="Follow on X">𝕏</a>
        <a className="icon-btn link gh" href={LINKS.github} target="_blank" rel="noreferrer" title="GitHub">GH</a>
        <button className="hud-exit" onClick={() => s.logout()}>Exit</button>
      </div>

      {/* bottom-left player card */}
      <div className="hud-bottomleft">
        <div className="player-card">
          <div className="player-name">{s.account?.name || s.name}</div>
          <div className="player-meta">{dino.name} · Lv {s.level}</div>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${(s.hp / s.maxHp) * 100}%` }} />
            <div className="bar-text">{s.hp} / {s.maxHp} HP</div>
          </div>
          <div className="skill-mini">
            {Object.entries(s.skills).map(([k, v]) => (
              <span key={k}>
                <b>{k.slice(0, 3).toUpperCase()}</b> {v.level}
                <span className="xp-line"><i style={{ width: `${(v.xp / (50 * v.level)) * 100}%` }} /></span>
              </span>
            ))}
            <span>
              <b>XP</b> {s.xp}/{xpForLevel}
              <span className="xp-line"><i style={{ width: `${(s.xp / xpForLevel) * 100}%`, background: '#ffd54f' }} /></span>
            </span>
          </div>
        </div>
      </div>

      {/* bottom-center hotbar */}
      <div className="hud-bottomcenter">
        <div className="hotbar">
          {s.hotbar.map((slot, i) => (
            <div
              key={i}
              className={'hot-slot' + (s.selectedSlot === i ? ' selected' : '')}
              onClick={() => s.selectSlot(i)}
            >
              <span className="hot-key">{i + 1}</span>
              {slot && <img className="hot-icon" src={itemIcon(slot.item)} alt={ITEMS[slot.item].name} />}
              {slot && slot.qty > 1 && <span className="hot-qty">{slot.qty}</span>}
            </div>
          ))}
        </div>
        <div className="hint-bar">
          <span><kbd>A</kbd><kbd>D</kbd> Move</span>
          <span><kbd>W</kbd> Jump</span>
          <span><kbd>Space</kbd> Attack</span>
          <span><kbd>E</kbd> Gather</span>
          <span><kbd>F</kbd> Eat</span>
        </div>
      </div>

      {/* bottom-right actions */}
      <div className="hud-bottomright">
        <button className="action-btn" onClick={() => s.openPanel('dino')}>🦖 Dinos</button>
        <button className="action-btn" onClick={() => s.openPanel('inventory')}>🎒 Bag</button>
        <button className="action-btn" onClick={() => s.openPanel('quests')}>📜 Quests</button>
        <button className="action-btn attack" onClick={() => fireAction('attack')}>⚔ Attack</button>
        <button className="action-btn eat" onClick={() => fireAction('eat')}>🍖 Eat</button>
      </div>

      {/* toasts */}
      <div className="toast-stack">
        {s.toasts.map((t) => <div key={t.id} className="toast">{t.text}</div>)}
      </div>

      <Chat />
      <Panels />
    </div>
  )
}

function fireAction(a) {
  window.dispatchEvent(new CustomEvent('pixa:action', { detail: a }))
}
