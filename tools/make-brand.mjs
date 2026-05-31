// Generates original PixelRex brand + repo assets:
//   avatar (400x400), banner (1500x500), gameplay scene (1280x720), dino roster.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { writeFileSync, mkdirSync } from 'node:fs'
import { DINOS } from '../src/data/dinos.js'

GlobalFonts.registerFromPath('C:/Windows/Fonts/consolab.ttf', 'ConsolasBold')
GlobalFonts.registerFromPath('C:/Windows/Fonts/consola.ttf', 'Consolas')

// Write straight into the repo so the images are versioned & shown in the README.
const OUT = 'brand'
mkdirSync(OUT, { recursive: true })

// brand green palette for the rex
const REX = { body: '#6dbf5a', belly: '#cdeec8', dark: '#3a6e2e', eye: '#ffd54f', claw: '#e8e3d3' }
const REX_P = { body: '#7a5cc0', belly: '#d8c8f0', dark: '#46306e', eye: '#ff5252', claw: '#f0e6d0' }

function px(ctx, x, y, w, h, color, s, ox = 0, oy = 0) {
  ctx.fillStyle = color
  ctx.fillRect(ox + x * s, oy + y * s, w * s, h * s)
}

// ---- biped rex silhouette (18x14 grid), reused from the game sprites ----
function drawRex(ctx, p, s, ox, oy, flip = false) {
  ctx.save()
  if (flip) { ctx.translate(ox + 18 * s, oy); ctx.scale(-1, 1); ox = 0; oy = 0 }
  const P = (x, y, w, h, c) => px(ctx, x, y, w, h, c, s, ox, oy)
  P(0, 7, 2, 2, p.dark); P(1, 6, 3, 3, p.body); P(3, 5, 3, 4, p.body)
  P(5, 4, 8, 6, p.body); P(5, 8, 8, 1, p.dark); P(6, 7, 6, 2, p.belly)
  P(12, 2, 4, 4, p.body); P(15, 3, 2, 3, p.body); P(16, 4, 1, 2, p.claw)
  P(14, 3, 1, 1, p.eye); P(12, 1, 3, 1, p.dark); P(11, 8, 2, 1, p.dark)
  P(6, 10, 2, 3, p.dark); P(5, 12, 3, 1, p.claw); P(10, 10, 2, 2, p.dark); P(10, 11, 3, 1, p.claw)
  ctx.restore()
}

function drawQuad(ctx, p, s, ox, oy) {
  const P = (x, y, w, h, c) => px(ctx, x, y, w, h, c, s, ox, oy)
  P(2, 5, 12, 5, p.body); P(2, 9, 12, 1, p.dark); P(3, 8, 10, 1, p.belly)
  P(4, 3, 2, 2, p.dark); P(7, 2, 2, 3, p.dark); P(10, 3, 2, 2, p.dark); P(0, 6, 2, 2, p.body)
  P(13, 4, 3, 3, p.body); P(15, 5, 2, 2, p.body); P(15, 4, 1, 1, p.eye)
  P(3, 10, 2, 3, p.dark); P(11, 10, 2, 2, p.dark); P(6, 10, 2, 2, p.dark); P(9, 10, 2, 3, p.dark)
}

function drawFlyer(ctx, p, s, ox, oy, flip = false) {
  ctx.save()
  if (flip) { ctx.translate(ox + 18 * s, oy); ctx.scale(-1, 1); ox = 0; oy = 0 }
  const P = (x, y, w, h, c) => px(ctx, x, y, w, h, c, s, ox, oy)
  P(6, 6, 5, 3, p.body); P(6, 8, 5, 1, p.dark)
  P(10, 4, 3, 3, p.body); P(13, 5, 2, 1, p.claw); P(11, 5, 1, 1, p.eye); P(9, 3, 2, 1, p.dark)
  P(1, 4, 6, 2, p.body); P(1, 6, 4, 1, p.belly); P(10, 4, 6, 2, p.body)
  P(7, 9, 1, 2, p.dark); P(9, 9, 1, 2, p.dark)
  ctx.restore()
}

const BODY = { raptor: 'biped', trex: 'biped', stego: 'quad', trike: 'quad', bronto: 'quad', ptero: 'flyer' }
function drawDino(ctx, id, pal, s, ox, oy, flip = false) {
  const t = BODY[id]
  if (t === 'quad') drawQuad(ctx, pal, s, ox, oy)
  else if (t === 'flyer') drawFlyer(ctx, pal, s, ox, oy, flip)
  else drawRex(ctx, pal, s, ox, oy, flip)
}

function drawFern(ctx, s, ox, oy) {
  const P = (x, y, w, h, c) => px(ctx, x, y, w, h, c, s, ox, oy)
  P(10, 14, 4, 6, '#5a3a1e')
  for (const [dx, dy, h] of [[6, 4, 10], [10, 1, 13], [14, 4, 10], [3, 8, 7], [17, 8, 7]]) {
    P(dx, dy, 2, h, '#3a6e2e'); P(dx, dy, 1, h, '#6dbf5a')
  }
}

function mountains(ctx, w, baseY, step, h, color) {
  ctx.fillStyle = color
  for (let x = -40; x < w + 40; x += step) {
    ctx.beginPath(); ctx.moveTo(x, baseY); ctx.lineTo(x + step / 2, baseY - h); ctx.lineTo(x + step, baseY); ctx.closePath(); ctx.fill()
  }
}

function glowText(ctx, text, x, y, size, fill, glow) {
  ctx.font = `${size}px ConsolasBold`
  ctx.textBaseline = 'middle'
  ctx.shadowColor = glow
  ctx.shadowBlur = size * 0.5
  ctx.fillStyle = fill
  ctx.fillText(text, x, y)
  ctx.fillText(text, x, y) // second pass = stronger glow
  ctx.shadowBlur = 0
}

// =========================================================
//  AVATAR 400x400
// =========================================================
function buildAvatar() {
  const W = 400, H = 400
  const c = createCanvas(W, H)
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false

  // background radial glow
  const g = ctx.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, 280)
  g.addColorStop(0, '#16241c'); g.addColorStop(1, '#0a0d11')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

  // subtle pixel-grid dots
  ctx.fillStyle = '#6dbf5a14'
  for (let x = 0; x < W; x += 20) for (let y = 0; y < H; y += 20) ctx.fillRect(x, y, 2, 2)

  // ground shadow
  ctx.fillStyle = '#00000055'
  ctx.beginPath(); ctx.ellipse(W / 2, 320, 130, 22, 0, 0, Math.PI * 2); ctx.fill()

  // big rex centered (grid 18x14, scale 18 -> 324x252)
  const s = 17
  const gw = 18 * s, gh = 14 * s
  drawRex(ctx, REX, s, (W - gw) / 2, (H - gh) / 2 - 6)

  // small wordmark bottom
  glowText(ctx, 'PIXELREX', W / 2 - measure(ctx, 'PIXELREX', 30) / 2, 360, 30, '#cdeec8', '#6dbf5a')

  writeFileSync(`${OUT}/pixelrex-avatar.png`, c.toBuffer('image/png'))
  console.log('avatar -> pixelrex-avatar.png (400x400)')
}

function measure(ctx, t, size) { ctx.font = `${size}px ConsolasBold`; return ctx.measureText(t).width }

// =========================================================
//  BANNER 1500x500
// =========================================================
function buildBanner() {
  const W = 1500, H = 500
  const c = createCanvas(W, H)
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false

  // sky gradient
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#0a0d11'); g.addColorStop(0.6, '#10181c'); g.addColorStop(1, '#0d1014')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

  // glow from the right where the wordmark sits
  const rg = ctx.createRadialGradient(1050, 230, 60, 1050, 230, 600)
  rg.addColorStop(0, '#6dbf5a22'); rg.addColorStop(1, '#0000')
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H)

  // stars
  ctx.fillStyle = '#6dbf5a'
  for (let i = 0; i < 90; i++) {
    const x = (i * 167) % W, y = (i * 89) % 260
    ctx.globalAlpha = 0.1 + (i % 5) * 0.06
    ctx.fillRect(x, y, 2, 2)
  }
  ctx.globalAlpha = 1

  // moon
  ctx.fillStyle = '#e8d5a8'; ctx.beginPath(); ctx.arc(180, 110, 46, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0d1014'; ctx.beginPath(); ctx.arc(160, 96, 40, 0, Math.PI * 2); ctx.fill()

  // parallax mountains
  mountains(ctx, W, 380, 220, 150, '#16242c')
  mountains(ctx, W, 400, 150, 95, '#1c3024')

  // ground
  ctx.fillStyle = '#3a2e1e'; ctx.fillRect(0, 400, W, 100)
  ctx.fillStyle = '#4a7a32'; ctx.fillRect(0, 400, W, 12)
  ctx.fillStyle = '#3a6026'; ctx.fillRect(0, 412, W, 4)
  ctx.fillStyle = '#6dbf5a'
  for (let x = 0; x < W; x += 26) ctx.fillRect(x + 4, 403, 3, 3)

  // dino scene on the left third
  drawFern(ctx, 5, 250, 300)
  drawFern(ctx, 4, 470, 320)
  drawRex(ctx, REX, 12, 70, 175)            // big hero rex
  drawQuad(ctx, { body: '#5a8fb0', belly: '#bfe2f0', dark: '#2f5870', eye: '#ffd54f' }, 6, 360, 290)
  drawRex(ctx, REX_P, 6, 540, 285, true)    // small purple rex facing back

  // wordmark
  glowText(ctx, 'PIXELREX', 740, 215, 128, '#cdeec8', '#6dbf5a')
  // accent underline
  ctx.fillStyle = '#6dbf5a'; ctx.fillRect(744, 285, 612, 6)
  // tagline
  ctx.font = '30px Consolas'; ctx.fillStyle = '#c9a96a'; ctx.textBaseline = 'middle'
  ctx.fillText('D I N O   W O R L D', 746, 330)
  ctx.font = '22px Consolas'; ctx.fillStyle = '#8a8678'
  ctx.fillText('Survive the Cretaceous · pixel-art survival', 746, 365)

  // vignette
  const vg = ctx.createLinearGradient(0, 0, 0, H)
  vg.addColorStop(0, '#0d101466'); vg.addColorStop(0.5, '#0000'); vg.addColorStop(1, '#0d101488')
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H)

  writeFileSync(`${OUT}/pixelrex-banner.png`, c.toBuffer('image/png'))
  console.log('banner -> pixelrex-banner.png (1500x500)')
}

// shared helpers for the framed images
function pill(ctx, x, y, w, h, border, bg = '#0d1014cc', r = 4) {
  ctx.fillStyle = bg; ctx.strokeStyle = border; ctx.lineWidth = 2
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.stroke()
}
function label(ctx, t, x, y, size, color, bold = false, align = 'left') {
  ctx.font = `${size}px ${bold ? 'ConsolasBold' : 'Consolas'}`
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'
  ctx.fillText(t, x, y); ctx.textAlign = 'left'
}

// =========================================================
//  DINO ROSTER 1200x460
// =========================================================
function buildRoster() {
  const W = 1200, H = 460
  const c = createCanvas(W, H); const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#0d1014'); g.addColorStop(1, '#0a0d11')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#6dbf5a10'
  for (let x = 0; x < W; x += 22) for (let y = 0; y < H; y += 22) ctx.fillRect(x, y, 2, 2)

  glowText(ctx, 'CHOOSE YOUR DINO', 40, 46, 34, '#cdeec8', '#6dbf5a')

  const cols = 3, rows = 2, pad = 26, top = 86
  const cw = (W - pad * (cols + 1)) / cols
  const ch = (H - top - pad * rows) / rows
  DINOS.forEach((d, i) => {
    const cx = pad + (i % cols) * (cw + pad)
    const cy = top + Math.floor(i / cols) * (ch + pad)
    pill(ctx, cx, cy, cw, ch, d.tier === 'premium' ? '#ffb43266' : '#6dbf5a55', '#ffffff08', 8)
    // sprite
    const s = 7, gw = 18 * s, gh = 14 * s
    drawDino(ctx, d.id, d.palette, s, cx + 24, cy + (ch - gh) / 2 - 6)
    // text block
    const tx = cx + 24 + gw + 18
    label(ctx, d.name.toUpperCase(), tx, cy + 34, 21, '#c8e8b0', true)
    label(ctx, d.tier === 'premium' ? `PREMIUM · ${d.price} PIXA` : 'FREE', tx, cy + 60, 14,
      d.tier === 'premium' ? '#ffb020' : '#6dbf5a', true)
    label(ctx, `HP ${d.stats.hp}`, tx, cy + 90, 15, '#8a8678')
    label(ctx, `SPD ${d.stats.speed}`, tx, cy + 112, 15, '#8a8678')
    label(ctx, `ATK ${d.stats.attack}`, tx, cy + 134, 15, '#8a8678')
  })
  writeFileSync(`${OUT}/roster.png`, c.toBuffer('image/png'))
  console.log('roster -> roster.png (1200x460)')
}

// =========================================================
//  GAMEPLAY SCENE 1280x720 (world + faux HUD)
// =========================================================
function buildScene() {
  const W = 1280, H = 720
  const c = createCanvas(W, H); const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false
  // sky
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#0a0d11'); g.addColorStop(0.62, '#10181c'); g.addColorStop(1, '#0d1014')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  // stars
  ctx.fillStyle = '#6dbf5a'
  for (let i = 0; i < 80; i++) { ctx.globalAlpha = 0.08 + (i % 5) * 0.05; ctx.fillRect((i * 211) % W, (i * 97) % 360, 2, 2) }
  ctx.globalAlpha = 1
  // moon
  ctx.fillStyle = '#e8d5a8'; ctx.beginPath(); ctx.arc(1090, 120, 40, 0, Math.PI * 2); ctx.fill()
  // mountains
  mountains(ctx, W, 540, 230, 170, '#16242c')
  mountains(ctx, W, 560, 150, 110, '#1c3024')
  // ground
  const gy = 540
  ctx.fillStyle = '#3a2e1e'; ctx.fillRect(0, gy, W, H - gy)
  ctx.fillStyle = '#4a7a32'; ctx.fillRect(0, gy, W, 14)
  ctx.fillStyle = '#3a6026'; ctx.fillRect(0, gy + 14, W, 5)
  ctx.fillStyle = '#6dbf5a'; for (let x = 0; x < W; x += 28) ctx.fillRect(x + 5, gy + 4, 3, 3)
  // actors
  drawFern(ctx, 5, 300, 438)
  drawFern(ctx, 4, 760, 458)
  drawDino(ctx, 'raptor', DINOS[0].palette, 11, 150, gy - 154)             // player
  drawDino(ctx, 'stego', DINOS[1].palette, 6, 560, gy - 84)
  drawDino(ctx, 'ptero', DINOS[4].palette, 5, 980, 300, true)
  // floating damage text for "action"
  glowText(ctx, '-18', 640, 360, 26, '#ff5252', '#000')

  // ---- faux HUD ----
  // top-left brand
  pill(ctx, 20, 20, 190, 38, '#6dbf5a');
  const s2 = 2; drawRex(ctx, REX, s2, 30, 28)
  label(ctx, 'PIXELREX', 76, 39, 19, '#cdeec8', true)
  pill(ctx, 20, 66, 168, 26, '#c9a96a', '#0d101499'); label(ctx, 'CRETACEOUS VALLEY', 30, 79, 13, '#c9a96a', true)
  // top-right stat pills
  const sp = (x, lab, val, vc) => { pill(ctx, x, 20, 116, 38, '#2a2f38'); label(ctx, lab, x + 12, 39, 12, '#8a8678', true); label(ctx, val, x + 104, 39, 17, vc, true, 'right') }
  sp(W - 20 - 116, 'PIXA', '1,840', '#c9a96a')
  sp(W - 20 - 116 * 2 - 8, 'GOLD', '350', '#ffd54f')
  pill(ctx, W - 20 - 116 * 2 - 8 - 132, 20, 124, 38, '#2a4a3a');
  ctx.fillStyle = '#6dbf5a'; ctx.beginPath(); ctx.arc(W - 20 - 116 * 2 - 8 - 132 + 16, 39, 5, 0, 7); ctx.fill()
  label(ctx, '32 ONLINE', W - 20 - 116 * 2 - 8 - 132 + 30, 39, 12, '#aee6a0', true)
  // bottom-left player card
  pill(ctx, 20, H - 116, 300, 96, '#2a2f38', '#0d1014cc', 6)
  label(ctx, 'Thang', 36, H - 96, 17, '#ffffff', true)
  label(ctx, 'Velo Raptor · Lv 2', 36, H - 74, 13, '#8a8678')
  ctx.fillStyle = '#00000080'; ctx.fillRect(36, H - 58, 268, 18)
  ctx.fillStyle = '#ff5252'; ctx.fillRect(36, H - 58, 268 * 0.62, 18)
  label(ctx, '56 / 90 HP', 36 + 134, H - 49, 12, '#fff', true, 'center')
  // bottom-center hotbar
  const slots = 6, ss = 52, gap = 6
  const hw = slots * ss + (slots - 1) * gap
  let hx = (W - hw) / 2; const hy = H - 86
  pill(ctx, hx - 8, hy - 8, hw + 16, ss + 16, '#2a2f38', '#0d1014cc', 4)
  const hot = [['#b03030', '2'], ['#a02050', '4'], ['#e8d5a8', ''], ['#8a5a2e', ''], null, null]
  for (let i = 0; i < slots; i++) {
    ctx.fillStyle = '#00000080'; ctx.strokeStyle = i === 0 ? '#ffd54f' : '#3a3f48'; ctx.lineWidth = i === 0 ? 2 : 1
    ctx.beginPath(); ctx.rect(hx, hy, ss, ss); ctx.fill(); ctx.stroke()
    label(ctx, String(i + 1), hx + 5, hy + 9, 11, '#6dbf5a', true)
    if (hot[i]) { ctx.fillStyle = hot[i][0]; ctx.fillRect(hx + 14, hy + 14, ss - 28, ss - 28); if (hot[i][1]) label(ctx, hot[i][1], hx + ss - 8, hy + ss - 9, 12, '#fff', true, 'right') }
    hx += ss + gap
  }
  // bottom-right action buttons
  const ab = (y, t, col) => { pill(ctx, W - 20 - 150, y, 150, 38, col, '#0d1014d9', 2); label(ctx, t, W - 20 - 75, y + 20, 14, '#cdeec8', true, 'center') }
  ab(H - 154, 'ATTACK', '#e0563b'); ab(H - 108, 'DINOS', '#6dbf5a'); ab(H - 62, 'BAG', '#6dbf5a')

  writeFileSync(`${OUT}/screenshot.png`, c.toBuffer('image/png'))
  console.log('scene -> screenshot.png (1280x720)')
}

// =========================================================
//  SOCIAL PREVIEW 1280x640 (shown when the repo/site link is pasted)
// =========================================================
function buildSocial() {
  const W = 1280, H = 640
  const c = createCanvas(W, H); const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false
  // sky
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#0a0d11'); g.addColorStop(0.6, '#10181c'); g.addColorStop(1, '#0d1014')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  // center glow
  const rg = ctx.createRadialGradient(W / 2, 250, 60, W / 2, 250, 620)
  rg.addColorStop(0, '#6dbf5a22'); rg.addColorStop(1, '#0000'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H)
  // stars
  ctx.fillStyle = '#6dbf5a'
  for (let i = 0; i < 90; i++) { ctx.globalAlpha = 0.08 + (i % 5) * 0.05; ctx.fillRect((i * 173) % W, (i * 91) % 360, 2, 2) }
  ctx.globalAlpha = 1
  // moon
  ctx.fillStyle = '#e8d5a8'; ctx.beginPath(); ctx.arc(1110, 110, 40, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0d1014'; ctx.beginPath(); ctx.arc(1092, 98, 34, 0, Math.PI * 2); ctx.fill()
  // mountains + ground
  mountains(ctx, W, 500, 240, 180, '#16242c')
  mountains(ctx, W, 520, 160, 120, '#1c3024')
  const gy = 500
  ctx.fillStyle = '#3a2e1e'; ctx.fillRect(0, gy, W, H - gy)
  ctx.fillStyle = '#4a7a32'; ctx.fillRect(0, gy, W, 14)
  ctx.fillStyle = '#3a6026'; ctx.fillRect(0, gy + 14, W, 5)
  ctx.fillStyle = '#6dbf5a'; for (let x = 0; x < W; x += 28) ctx.fillRect(x + 5, gy + 4, 3, 3)
  // dinos along the ground
  drawFern(ctx, 4, 250, 470)
  drawDino(ctx, 'raptor', DINOS[0].palette, 8, 110, gy - 112)
  drawDino(ctx, 'stego', DINOS[1].palette, 5, 470, gy - 70)
  drawDino(ctx, 'trike', DINOS[2].palette, 5, 720, gy - 70)
  drawDino(ctx, 'ptero', DINOS[4].palette, 4, 980, 250, true)
  drawFern(ctx, 4, 900, 470)
  // wordmark + tagline (centered)
  ctx.textAlign = 'center'
  glowText(ctx, 'PIXELREX', W / 2 - measure(ctx, 'PIXELREX', 110) / 2, 210, 110, '#cdeec8', '#6dbf5a')
  ctx.fillStyle = '#6dbf5a'; ctx.fillRect(W / 2 - 260, 268, 520, 5)
  label(ctx, 'D I N O   W O R L D', W / 2, 308, 26, '#c9a96a', true, 'center')
  label(ctx, 'Pixel-art dinosaur survival · Vite + React + Phaser', W / 2, 344, 20, '#8a8678', false, 'center')
  ctx.textAlign = 'left'
  // vignette
  const vg = ctx.createLinearGradient(0, 0, 0, H)
  vg.addColorStop(0, '#0d101455'); vg.addColorStop(0.5, '#0000'); vg.addColorStop(1, '#0d101488')
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H)

  const buf = c.toBuffer('image/png')
  writeFileSync(`${OUT}/social-preview.png`, buf)
  mkdirSync('public', { recursive: true })
  writeFileSync('public/social-preview.png', buf) // served by the site for OG tags
  console.log('social -> social-preview.png (1280x640)')
}

// =========================================================
//  FAVICON / app icons (served from public/)
// =========================================================
function buildIcon(size, file) {
  const c = createCanvas(size, size); const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false
  // rounded dark tile + glow
  const r = Math.round(size * 0.18)
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.7)
  g.addColorStop(0, '#16241c'); g.addColorStop(1, '#0a0d11')
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, 0, size, size, r); ctx.fill()
  ctx.strokeStyle = '#6dbf5a'; ctx.lineWidth = Math.max(1, size * 0.04)
  ctx.beginPath(); ctx.roundRect(ctx.lineWidth / 2, ctx.lineWidth / 2, size - ctx.lineWidth, size - ctx.lineWidth, r); ctx.stroke()
  // centered rex (grid 18x14)
  const s = Math.floor(size / 22)
  const gw = 18 * s, gh = 14 * s
  drawRex(ctx, REX, s, (size - gw) / 2, (size - gh) / 2)
  mkdirSync('public', { recursive: true })
  writeFileSync(`public/${file}`, c.toBuffer('image/png'))
  console.log(`icon -> public/${file} (${size}x${size})`)
}

buildAvatar()
buildBanner()
buildRoster()
buildScene()
buildSocial()
buildIcon(64, 'favicon.png')
buildIcon(180, 'apple-touch-icon.png')
console.log('Done. Files in', OUT)
