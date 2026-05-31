import { create } from 'zustand'
import { DINOS, DINO_BY_ID } from './data/dinos.js'
import { ITEMS } from './data/items.js'
import { QUESTS } from './data/quests.js'
import { seedMarket } from './data/market.js'

const xpForLevel = (lvl) => 60 * lvl * lvl
let toastId = 0

const emptyHotbar = () => [
  { item: 'meat', qty: 2 },
  { item: 'berry', qty: 4 },
  null, null, null, null,
]

export const useGame = create((set, get) => ({
  // ---- flow ----
  phase: 'boot', // boot | auth | playing

  // ---- account (Login replaces wallet connect) ----
  loggedIn: false,
  account: null, // { name, address }
  guest: false,
  premiumUnlocked: false,

  // ---- economy ----
  gold: 0,
  pixa: 0,

  // ---- player ----
  species: 'raptor',
  ownedDinos: ['raptor', 'stego', 'trike'],
  name: 'Wanderer',
  hp: 90,
  maxHp: 90,
  level: 1,
  xp: 0,
  skills: {
    survival: { level: 1, xp: 0 },
    combat: { level: 1, xp: 0 },
    excavation: { level: 1, xp: 0 },
  },

  // ---- inventory ----
  hotbar: emptyHotbar(),
  selectedSlot: 0,
  inventory: [
    { item: 'fern', qty: 3 },
    { item: 'bone', qty: 1 },
  ],

  // ---- quests ----
  quests: QUESTS.map((q) => ({ id: q.id, progress: 0, claimed: false })),
  track: { kills: 0, gather: 0, eggs: 0, bones: 0, level: 1 },

  // ---- market ----
  market: seedMarket(),

  // ---- world / social ----
  onlineCount: 1 + Math.floor((Date.now() % 240)),
  chat: [
    { name: 'FernQueen', text: 'anyone selling amber?', me: false },
    { name: 'TarPitTom', text: 'raptor pack near the tar pits, careful', me: false },
  ],

  // ---- ui ----
  panel: null, // inventory | bank | market | quests | dino | help | docs | rewards | wallet | null
  toasts: [],

  // =========================================================
  //  ACTIONS
  // =========================================================
  bootDone: () => set({ phase: 'auth' }),

  // The "Login" action — functionally equivalent to having connected a wallet.
  login: (name) => {
    const addr = makeAddress()
    set({
      loggedIn: true,
      guest: false,
      premiumUnlocked: true,
      account: { name: name || 'Player', address: addr },
      name: name || 'Wanderer',
      gold: 350,
      pixa: 1840,
      phase: 'playing',
    })
    get().toast('Logged in — wallet linked')
  },

  playAsGuest: () => {
    set({
      loggedIn: false,
      guest: true,
      premiumUnlocked: false,
      gold: 80,
      pixa: 0,
      phase: 'playing',
    })
    get().toast('Playing as guest')
  },

  logout: () => set({
    phase: 'auth', loggedIn: false, guest: false, premiumUnlocked: false,
    account: null, panel: null,
  }),

  openPanel: (p) => set((s) => ({ panel: s.panel === p ? null : p })),
  closePanel: () => set({ panel: null }),

  selectSlot: (i) => set({ selectedSlot: i }),

  setSpecies: (id) => {
    const d = DINO_BY_ID[id]
    if (!d) return
    const owned = get().ownedDinos.includes(id)
    if (d.tier === 'premium' && !owned) {
      // try to buy with pixa
      if (get().pixa >= d.price) {
        set((s) => ({ pixa: s.pixa - d.price, ownedDinos: [...s.ownedDinos, id] }))
        get().toast(`Unlocked ${d.name}!`)
      } else {
        get().toast('Not enough PIXA — login to get more')
        return
      }
    }
    set({
      species: id,
      maxHp: d.stats.hp,
      hp: d.stats.hp,
    })
    get().toast(`Now playing ${d.name}`)
    window.dispatchEvent(new CustomEvent('pixa:species', { detail: id }))
  },

  // ---- inventory helpers ----
  addItem: (itemId, qty = 1) => {
    set((s) => {
      const inv = mergeStack([...s.hotbar], [...s.inventory], itemId, qty)
      return { hotbar: inv.hotbar, inventory: inv.inventory }
    })
  },

  consumeSelected: () => {
    const s = get()
    const slot = s.hotbar[s.selectedSlot]
    if (!slot) return
    const def = ITEMS[slot.item]
    if (def?.heal) {
      const hp = Math.min(s.maxHp, s.hp + def.heal)
      const hb = [...s.hotbar]
      hb[s.selectedSlot] = slot.qty > 1 ? { ...slot, qty: slot.qty - 1 } : null
      set({ hp, hotbar: hb })
      s.toast(`+${def.heal} HP`)
    } else {
      s.toast('Cannot eat that')
    }
  },

  damage: (amt) => {
    set((s) => {
      const hp = Math.max(0, s.hp - amt)
      if (hp === 0) {
        s.toast('You fainted! Respawning…')
        return { hp: s.maxHp }
      }
      return { hp }
    })
  },

  // ---- progression ----
  gainXp: (amt) => {
    set((s) => {
      let xp = s.xp + amt
      let level = s.level
      while (xp >= xpForLevel(level)) {
        xp -= xpForLevel(level)
        level += 1
        s.toast(`Level up! Now level ${level}`)
      }
      const track = { ...s.track, level }
      return { xp, level, track }
    })
    get().checkQuests()
  },

  gainSkill: (skill, amt) => set((s) => {
    const sk = { ...s.skills[skill] }
    sk.xp += amt
    while (sk.xp >= 50 * sk.level) { sk.xp -= 50 * sk.level; sk.level += 1 }
    return { skills: { ...s.skills, [skill]: sk } }
  }),

  // ---- world events from Phaser ----
  onKill: () => {
    const s = get()
    s.addItem('meat', 1)
    if (Math.random() < 0.35) s.addItem('hide', 1)
    if (Math.random() < 0.15) s.addItem('claw', 1)
    set((st) => ({ track: { ...st.track, kills: st.track.kills + 1 } }))
    s.gainXp(25)
    s.gainSkill('combat', 12)
    s.checkQuests()
  },

  onGather: (kind) => {
    const s = get()
    if (kind === 'egg') { s.addItem('egg', 1); set((st) => ({ track: { ...st.track, eggs: st.track.eggs + 1 } })) }
    else if (kind === 'bone') { s.addItem('bone', 1); set((st) => ({ track: { ...st.track, bones: st.track.bones + 1, gather: st.track.gather + 1 } })) }
    else if (kind === 'amber') { s.addItem('amber', 1); s.addItem('crystal', Math.random() < 0.2 ? 1 : 0) }
    else { s.addItem('fern', 1); set((st) => ({ track: { ...st.track, gather: st.track.gather + 1 } })) }
    s.gainXp(10)
    s.gainSkill('excavation', 8)
    s.checkQuests()
  },

  checkQuests: () => set((s) => {
    const quests = s.quests.map((q) => {
      const def = QUESTS.find((d) => d.id === q.id)
      const progress = Math.min(def.goal, s.track[def.track] || 0)
      return { ...q, progress }
    })
    return { quests }
  }),

  claimQuest: (id) => {
    const s = get()
    const def = QUESTS.find((d) => d.id === id)
    const q = s.quests.find((x) => x.id === id)
    if (!q || q.claimed || q.progress < def.goal) return
    set((st) => ({
      gold: st.gold + def.reward.gold,
      quests: st.quests.map((x) => (x.id === id ? { ...x, claimed: true } : x)),
    }))
    if (def.reward.xp) s.gainXp(def.reward.xp)
    s.toast(`Quest reward: +${def.reward.gold} gold`)
  },

  // ---- market ----
  buy: (id) => {
    const s = get()
    const offer = s.market.find((m) => m.id === id)
    if (!offer) return
    if (s.gold < offer.price) { s.toast('Not enough gold'); return }
    set((st) => ({
      gold: st.gold - offer.price,
      market: st.market.map((m) => (m.id === id ? { ...m, qty: m.qty - 1 } : m)).filter((m) => m.qty > 0),
    }))
    s.addItem(offer.item, 1)
    s.toast(`Bought ${ITEMS[offer.item].name}`)
  },

  sell: (itemId) => {
    const s = get()
    const def = ITEMS[itemId]
    // remove one from hotbar or inventory
    const removed = removeOne(get, set, itemId)
    if (!removed) { s.toast('None to sell'); return }
    set((st) => ({ gold: st.gold + (def.value || 1) }))
    s.toast(`Sold ${def.name} +${def.value || 1}g`)
  },

  // ---- chat ----
  sendChat: (text) => {
    if (!text.trim()) return
    set((s) => ({ chat: [...s.chat, { name: s.account?.name || s.name, text, me: true }] }))
    // simulated reply
    setTimeout(() => {
      const replies = ['nice!', 'gl out there', 'watch the trex', 'wts amber 25g', 'anyone near the falls?']
      set((s) => ({ chat: [...s.chat, { name: 'TarPitTom', text: replies[Math.floor(Math.random() * replies.length)], me: false }] }))
    }, 1200)
  },

  // ---- toasts ----
  toast: (text) => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts, { id, text }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2200)
  },
}))

// ---------- helpers ----------
function makeAddress() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let a = ''
  for (let i = 0; i < 44; i++) a += chars[Math.floor(Math.random() * chars.length)]
  return a
}

function mergeStack(hotbar, inventory, itemId, qty) {
  if (qty <= 0) return { hotbar, inventory }
  // existing stack in hotbar
  let i = hotbar.findIndex((s) => s && s.item === itemId)
  if (i >= 0) { hotbar[i] = { ...hotbar[i], qty: hotbar[i].qty + qty }; return { hotbar, inventory } }
  // existing stack in inventory
  let j = inventory.findIndex((s) => s && s.item === itemId)
  if (j >= 0) { inventory[j] = { ...inventory[j], qty: inventory[j].qty + qty }; return { hotbar, inventory } }
  // empty hotbar slot
  let e = hotbar.findIndex((s) => !s)
  if (e >= 0) { hotbar[e] = { item: itemId, qty }; return { hotbar, inventory } }
  // push to inventory
  inventory.push({ item: itemId, qty })
  return { hotbar, inventory }
}

function removeOne(get, set, itemId) {
  const s = get()
  let i = s.hotbar.findIndex((x) => x && x.item === itemId)
  if (i >= 0) {
    const hb = [...s.hotbar]
    hb[i] = hb[i].qty > 1 ? { ...hb[i], qty: hb[i].qty - 1 } : null
    set({ hotbar: hb })
    return true
  }
  let j = s.inventory.findIndex((x) => x && x.item === itemId)
  if (j >= 0) {
    const inv = [...s.inventory]
    if (inv[j].qty > 1) inv[j] = { ...inv[j], qty: inv[j].qty - 1 }
    else inv.splice(j, 1)
    set({ inventory: inv })
    return true
  }
  return false
}

export { DINOS, DINO_BY_ID }
