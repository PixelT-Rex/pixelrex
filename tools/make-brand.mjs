// Generates original PixelRex brand assets for X: avatar (400x400) + banner (1500x500).
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { writeFileSync, mkdirSync } from 'node:fs'

GlobalFonts.registerFromPath('C:/Windows/Fonts/consolab.ttf', 'ConsolasBold')
GlobalFonts.registerFromPath('C:/Windows/Fonts/consola.ttf', 'Consolas')

const OUT = 'D:/pixelrex-assets'
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

buildAvatar()
buildBanner()
console.log('Done. Files in', OUT)
