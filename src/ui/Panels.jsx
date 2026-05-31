import { useState } from 'react'
import { useGame } from '../store.js'
import { itemIcon, dinoThumb } from './icons.js'
import { ITEMS, ITEM_LIST } from '../data/items.js'
import { QUESTS } from '../data/quests.js'
import { DINOS } from '../data/dinos.js'

export default function Panels() {
  const panel = useGame((s) => s.panel)
  const close = useGame((s) => s.closePanel)
  if (!panel) return null
  const map = {
    inventory: <Inventory />, market: <Market />, quests: <Quests />,
    dino: <DinoSelect />, help: <Help />, docs: <Docs />,
    rewards: <Rewards />, wallet: <Wallet />,
  }
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target.classList.contains('overlay')) close() }}>
      {map[panel]}
    </div>
  )
}

function Head({ title, klass, right }) {
  const close = useGame((s) => s.closePanel)
  return (
    <div className="panel-head">
      <span className="panel-title">{title}</span>
      {right}
      <button className="panel-close" onClick={close}>×</button>
    </div>
  )
}

/* ---------------- Inventory ---------------- */
function Inventory() {
  const s = useGame()
  const all = [...s.hotbar.filter(Boolean), ...s.inventory]
  const slots = []
  for (let i = 0; i < 24; i++) slots.push(all[i] || null)
  return (
    <div className="panel">
      <Head title="Inventory" />
      <div className="panel-body">
        <div className="inv-grid">
          {slots.map((slot, i) => (
            <div className="inv-slot" key={i} title={slot ? ITEMS[slot.item].name : ''}>
              {slot && <img className="inv-icon" src={itemIcon(slot.item)} alt="" />}
              {slot && slot.qty > 1 && <span className="inv-qty">{slot.qty}</span>}
            </div>
          ))}
        </div>
        <div className="inv-footer">Gather in the world with <kbd>E</kbd> · sell at the Marketplace</div>
      </div>
    </div>
  )
}

/* ---------------- Market ---------------- */
function Market() {
  const s = useGame()
  const [tab, setTab] = useState('buy')
  const owned = {}
  ;[...s.hotbar.filter(Boolean), ...s.inventory].forEach((x) => { owned[x.item] = (owned[x.item] || 0) + x.qty })
  return (
    <div className="panel sand" style={{ width: 560 }}>
      <Head title="Marketplace" right={<span style={{ marginLeft: 'auto', marginRight: 12, color: '#ffd54f', fontWeight: 700 }}>{s.gold} g</span>} />
      <div className="market-tabs">
        <button className={'market-tab' + (tab === 'buy' ? ' active' : '')} onClick={() => setTab('buy')}>Buy</button>
        <button className={'market-tab' + (tab === 'sell' ? ' active' : '')} onClick={() => setTab('sell')}>Sell</button>
      </div>
      <div className="panel-body">
        {tab === 'buy' ? (
          s.market.length === 0 ? <div className="market-empty">No listings right now</div> :
          s.market.map((m) => (
            <div className="market-row" key={m.id}>
              <img className="market-icon" src={itemIcon(m.item)} alt="" />
              <div>
                <div className="market-name">{ITEMS[m.item].name}</div>
                <div className="market-seller">{m.seller} · x{m.qty}</div>
              </div>
              <div className="market-price">{m.price} g</div>
              <button className="market-btn" disabled={s.gold < m.price} onClick={() => s.buy(m.id)}>Buy</button>
            </div>
          ))
        ) : (
          ITEM_LIST.filter((it) => owned[it.id]).length === 0 ? <div className="market-empty">Nothing to sell — go gather!</div> :
          ITEM_LIST.filter((it) => owned[it.id]).map((it) => (
            <div className="market-row" key={it.id}>
              <img className="market-icon" src={itemIcon(it.id)} alt="" />
              <div>
                <div className="market-name">{it.name}</div>
                <div className="market-seller">You own x{owned[it.id]}</div>
              </div>
              <div className="market-price">{it.value} g</div>
              <button className="market-btn" onClick={() => s.sell(it.id)}>Sell</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ---------------- Quests ---------------- */
function Quests() {
  const s = useGame()
  return (
    <div className="panel" style={{ width: 540 }}>
      <Head title="Quests" />
      <div className="panel-body">
        {QUESTS.map((def) => {
          const q = s.quests.find((x) => x.id === def.id)
          const ready = q.progress >= def.goal && !q.claimed
          return (
            <div className={'quest-row' + (ready ? ' ready' : '') + (q.claimed ? ' done' : '')} key={def.id}>
              <div className="quest-icon">{def.icon}</div>
              <div>
                <div className="quest-desc">{def.desc}</div>
                <div className="quest-bar">
                  <div className="quest-bar-fill" style={{ width: `${(q.progress / def.goal) * 100}%` }} />
                  <div className="quest-bar-text">{q.progress} / {def.goal}</div>
                </div>
                <div className="quest-reward">Reward: +{def.reward.gold} gold{def.reward.xp ? ` · +${def.reward.xp} XP` : ''}</div>
              </div>
              <button
                className={'quest-claim' + (ready ? ' active' : '') + (q.claimed ? ' claimed' : '')}
                onClick={() => ready && s.claimQuest(def.id)}
              >
                {q.claimed ? '✓ Done' : ready ? 'Claim' : 'Locked'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- Dino select ---------------- */
function DinoSelect() {
  const s = useGame()
  return (
    <div className="panel" style={{ width: 'min(820px, 96vw)' }}>
      <Head title="Choose your dinosaur" right={<span style={{ marginLeft: 'auto', marginRight: 12, color: '#c9a96a', fontWeight: 700 }}>{s.pixa} PIXA</span>} />
      <div className="panel-body">
        <div className="dino-grid">
          {DINOS.map((d) => {
            const owned = s.ownedDinos.includes(d.id)
            const active = s.species === d.id
            const locked = d.tier === 'premium' && !owned
            return (
              <button className={'dino-card' + (active ? ' active' : '')} key={d.id} onClick={() => s.setSpecies(d.id)}>
                <div className="dino-sprite">
                  <img src={dinoThumb(d.id)} alt={d.name} />
                </div>
                <div className="dino-info">
                  <div className="dino-name">{d.name}</div>
                  <div className="dino-desc">{d.desc}</div>
                  <div style={{ fontSize: 10, color: '#8a8678', letterSpacing: '.04em' }}>
                    HP {d.stats.hp} · SPD {d.stats.speed} · ATK {d.stats.attack}
                  </div>
                  <div className="dino-tags">
                    {d.tier === 'free' && <span className="tag free">Free</span>}
                    {owned && d.tier === 'premium' && <span className="tag owned">Owned</span>}
                    {locked && <span className="tag premium">{d.price} PIXA</span>}
                    {active && <span className="tag owned">Active</span>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {!s.loggedIn && <div className="inv-footer">Login to get PIXA and unlock premium dinos.</div>}
      </div>
    </div>
  )
}

/* ---------------- Help ---------------- */
function Help() {
  return (
    <div className="panel" style={{ width: 'min(720px, 95vw)' }}>
      <Head title="How to play" />
      <div className="panel-body doc-text">
        <p>Survive the Cretaceous. Hunt wild dinos, gather resources, complete quests and grow your beast.</p>
        <h4>Controls</h4>
        <ul>
          <li><kbd>A</kbd> / <kbd>D</kbd> or arrow keys — move left / right</li>
          <li><kbd>W</kbd> / <kbd>↑</kbd> — jump</li>
          <li><kbd>Space</kbd> — attack nearby dinos</li>
          <li><kbd>E</kbd> — gather from ferns, rocks, bones &amp; nests</li>
          <li><kbd>F</kbd> — eat the selected hotbar food to heal</li>
          <li><kbd>1</kbd>–<kbd>6</kbd> / click — select hotbar slot</li>
        </ul>
        <h4>Progression</h4>
        <ul>
          <li>Hunting gives meat + combat XP; gathering gives materials + excavation XP.</li>
          <li>Level up to unlock quests and earn gold.</li>
          <li>Spend gold at the Marketplace, spend PIXA to unlock premium dinosaurs.</li>
        </ul>
      </div>
    </div>
  )
}

/* ---------------- Docs ---------------- */
const DOC_SECTIONS = [
  { id: 'about', t: 'About', body: (
    <><p><strong>PixelRex — Dino World</strong> is a pixel-art dinosaur survival sandbox. This build is an original single-player recreation.</p>
    <p>Roam a side-scrolling Cretaceous valley, hunt, gather, trade and complete quests as one of six dinosaur species.</p></>
  ) },
  { id: 'account', t: 'Account & Login', body: (
    <><p>Press <strong>Login</strong> on the start screen to link an account. This replaces the usual wallet connect: it grants you a wallet address, a PIXA balance, premium dino access and reward eligibility — exactly like a connected wallet.</p>
    <p>You can also <strong>Play as guest</strong> with limited gold and no premium content.</p></>
  ) },
  { id: 'economy', t: 'Economy', body: (
    <><p><strong>Gold</strong> is the in-world currency for the Marketplace. Earn it from quests and selling gathered items.</p>
    <p><strong>PIXA</strong> is the premium token granted on login, used to unlock premium dinosaurs (T-Rex, Pteranodon, Brontogiant).</p></>
  ) },
  { id: 'faq', t: 'FAQ', body: (
    <><p><strong>Is this multiplayer?</strong> The online count and chat are simulated in this single-player demo.</p>
    <p><strong>Is it on-chain?</strong> No — login stands in for wallet connect; balances are local.</p></>
  ) },
]
function Docs() {
  const [sec, setSec] = useState('about')
  const cur = DOC_SECTIONS.find((d) => d.id === sec)
  return (
    <div className="panel" style={{ width: 'min(880px, 96vw)', height: '80vh' }}>
      <Head title="Documentation" />
      <div className="panel-body" style={{ display: 'flex', gap: 18, flex: 1, minHeight: 0 }}>
        <div style={{ width: 160, borderRight: '1px solid #2a2f38', paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DOC_SECTIONS.map((d) => (
            <button key={d.id} onClick={() => setSec(d.id)} style={{ textAlign: 'left', background: sec === d.id ? '#6dbf5a14' : 'transparent', border: 'none', borderLeft: '2px solid ' + (sec === d.id ? '#6dbf5a' : 'transparent'), color: '#c9c4b3', fontFamily: 'inherit', fontSize: 12, padding: '7px 10px', cursor: 'pointer' }}>{d.t}</button>
          ))}
        </div>
        <div className="doc-text" style={{ flex: 1, overflowY: 'auto' }}>
          <h4>{cur.t}</h4>
          {cur.body}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Rewards ---------------- */
function Rewards() {
  const s = useGame()
  const board = [
    { name: s.account?.name || 'You', amt: s.pixa, me: true },
    { name: 'RaptorKing', amt: 4200 }, { name: 'AmberAda', amt: 3110 },
    { name: 'FernQueen', amt: 2740 }, { name: 'BoneBaron', amt: 1980 },
  ].sort((a, b) => b.amt - a.amt)
  return (
    <div className="panel gold" style={{ width: 'min(560px, 94vw)' }}>
      <Head title="PIXA Rewards" />
      <div className="panel-body">
        <p style={{ fontSize: 12, color: '#8b96a5', margin: '0 0 12px' }}>Top earners in the valley. Your PIXA balance: <strong style={{ color: '#c9a96a' }}>{s.pixa}</strong></p>
        {board.map((r, i) => (
          <div className="market-row" key={i} style={{ gridTemplateColumns: '28px 1fr auto' }}>
            <span style={{ color: '#6b7480', textAlign: 'center' }}>#{i + 1}</span>
            <span style={{ color: r.me ? '#6dbf5a' : '#cdd6e0', fontWeight: r.me ? 700 : 400 }}>{r.name}</span>
            <span style={{ color: '#ffd54f', fontWeight: 700 }}>{r.amt.toLocaleString()} PIXA</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Wallet / Account ---------------- */
function Wallet() {
  const s = useGame()
  return (
    <div className="panel cyan" style={{ width: 'min(460px, 94vw)' }}>
      <Head title="Account" />
      <div className="panel-body doc-text">
        <p><strong>Status:</strong> {s.loggedIn ? 'Logged in · wallet linked' : 'Guest'}</p>
        {s.account && <p style={{ wordBreak: 'break-all' }}><strong>Address:</strong> <code style={{ color: '#4fd6ff' }}>{s.account.address}</code></p>}
        <p><strong>Gold:</strong> {s.gold.toLocaleString()} · <strong>PIXA:</strong> {s.pixa.toLocaleString()}</p>
        <p><strong>Dinos owned:</strong> {s.ownedDinos.length} / {DINOS.length}</p>
        <button className="auth-btn" style={{ marginTop: 14 }} onClick={() => s.logout()}>Log out</button>
      </div>
    </div>
  )
}
