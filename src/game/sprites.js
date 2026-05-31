// Procedural ORIGINAL pixel-art generator. Builds Phaser canvas textures at
// runtime from rectangle "parts" — no external/borrowed image assets.
import { DINOS } from '../data/dinos.js'

const S = 4 // pixel scale for dinos (grid unit -> screen px)

function rect(ctx, x, y, w, h, color, scale = S) {
  ctx.fillStyle = color
  ctx.fillRect(x * scale, y * scale, w * scale, h * scale)
}

// ---- dinosaur silhouettes (grid is 18 wide x 14 tall) ----
function drawBiped(ctx, p, frame) {
  // tail
  rect(ctx, 0, 7, 2, 2, p.dark)
  rect(ctx, 1, 6, 3, 3, p.body)
  rect(ctx, 3, 5, 3, 4, p.body)
  // body
  rect(ctx, 5, 4, 8, 6, p.body)
  rect(ctx, 5, 8, 8, 1, p.dark)
  rect(ctx, 6, 7, 6, 2, p.belly)
  // neck + head
  rect(ctx, 12, 2, 4, 4, p.body)
  rect(ctx, 15, 3, 2, 3, p.body)     // snout
  rect(ctx, 16, 4, 1, 2, p.claw)     // teeth
  rect(ctx, 14, 3, 1, 1, p.eye)      // eye
  rect(ctx, 12, 1, 3, 1, p.dark)     // head top
  // tiny arm
  rect(ctx, 11, 8, 2, 1, p.dark)
  // legs (animated)
  if (frame === 0) {
    rect(ctx, 6, 10, 2, 3, p.dark); rect(ctx, 5, 12, 3, 1, p.claw)
    rect(ctx, 10, 10, 2, 2, p.dark); rect(ctx, 10, 11, 3, 1, p.claw)
  } else {
    rect(ctx, 6, 10, 2, 2, p.dark); rect(ctx, 6, 11, 3, 1, p.claw)
    rect(ctx, 10, 10, 2, 3, p.dark); rect(ctx, 9, 12, 3, 1, p.claw)
  }
}

function drawQuad(ctx, p, frame) {
  // long body
  rect(ctx, 2, 5, 12, 5, p.body)
  rect(ctx, 2, 9, 12, 1, p.dark)
  rect(ctx, 3, 8, 10, 1, p.belly)
  // back plates / shading
  rect(ctx, 4, 3, 2, 2, p.dark)
  rect(ctx, 7, 2, 2, 3, p.dark)
  rect(ctx, 10, 3, 2, 2, p.dark)
  // tail
  rect(ctx, 0, 6, 2, 2, p.body)
  // neck + head
  rect(ctx, 13, 4, 3, 3, p.body)
  rect(ctx, 15, 5, 2, 2, p.body)
  rect(ctx, 15, 4, 1, 1, p.eye)
  // legs
  if (frame === 0) {
    rect(ctx, 3, 10, 2, 3, p.dark); rect(ctx, 11, 10, 2, 2, p.dark)
    rect(ctx, 6, 10, 2, 2, p.dark); rect(ctx, 9, 10, 2, 3, p.dark)
  } else {
    rect(ctx, 3, 10, 2, 2, p.dark); rect(ctx, 11, 10, 2, 3, p.dark)
    rect(ctx, 6, 10, 2, 3, p.dark); rect(ctx, 9, 10, 2, 2, p.dark)
  }
  rect(ctx, 3, 12, 2, 1, p.claw); rect(ctx, 9, 12, 2, 1, p.claw)
}

function drawFlyer(ctx, p, frame) {
  // body
  rect(ctx, 6, 6, 5, 3, p.body)
  rect(ctx, 6, 8, 5, 1, p.dark)
  // head crest
  rect(ctx, 10, 4, 3, 3, p.body)
  rect(ctx, 13, 5, 2, 1, p.claw) // beak
  rect(ctx, 11, 5, 1, 1, p.eye)
  rect(ctx, 9, 3, 2, 1, p.dark)  // crest
  // wings (flap)
  if (frame === 0) {
    rect(ctx, 1, 4, 6, 2, p.body); rect(ctx, 1, 6, 4, 1, p.belly)
    rect(ctx, 10, 4, 6, 2, p.body)
  } else {
    rect(ctx, 2, 7, 5, 2, p.body); rect(ctx, 11, 7, 5, 2, p.body)
    rect(ctx, 3, 5, 4, 2, p.belly)
  }
  // legs tucked
  rect(ctx, 7, 9, 1, 2, p.dark); rect(ctx, 9, 9, 1, 2, p.dark)
}

const BODY_TYPE = {
  raptor: 'biped', trex: 'biped',
  stego: 'quad', trike: 'quad', bronto: 'quad',
  ptero: 'flyer',
}

function newCanvas(scene, key, w, h) {
  if (scene.textures.exists(key)) scene.textures.remove(key)
  const tex = scene.textures.createCanvas(key, w, h)
  return { tex, ctx: tex.getContext() }
}

export function generateTextures(scene) {
  // --- dinos: two frames each ---
  for (const d of DINOS) {
    const type = BODY_TYPE[d.id]
    const draw = type === 'biped' ? drawBiped : type === 'quad' ? drawQuad : drawFlyer
    for (let f = 0; f < 2; f++) {
      const { tex, ctx } = newCanvas(scene, `dino_${d.id}_${f}`, 18 * S, 14 * S)
      draw(ctx, d.palette, f)
      tex.refresh()
    }
  }

  // --- terrain tiles ---
  buildGroundTile(scene)
  buildBackdrops(scene)
  buildProps(scene)

  // --- item icons ---
  for (const [key, fn] of Object.entries(ITEM_DRAW)) {
    const sc = 2
    const { tex, ctx } = newCanvas(scene, `item_${key}`, 16 * sc, 16 * sc)
    fn(ctx, sc)
    tex.refresh()
  }
}

function buildGroundTile(scene) {
  const sc = 2
  const { tex, ctx } = newCanvas(scene, 'tile_ground', 16 * sc, 16 * sc)
  rect(ctx, 0, 0, 16, 16, '#3a2e1e', sc)       // dirt
  rect(ctx, 0, 0, 16, 3, '#4a7a32', sc)        // grass top
  rect(ctx, 0, 3, 16, 1, '#3a6026', sc)
  for (let i = 0; i < 16; i += 4) rect(ctx, i + 1, 1, 1, 1, '#6dbf5a', sc)
  rect(ctx, 3, 7, 2, 2, '#2e2416', sc)
  rect(ctx, 10, 11, 3, 2, '#2e2416', sc)
  tex.refresh()
}

function buildBackdrops(scene) {
  // far mountains
  let { tex, ctx } = newCanvas(scene, 'bg_far', 320, 180)
  const g = ctx.createLinearGradient(0, 0, 0, 180)
  g.addColorStop(0, '#0d1014'); g.addColorStop(1, '#16202a')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 320, 180)
  ctx.fillStyle = '#1c2a30'
  for (let x = -20; x < 340; x += 70) {
    ctx.beginPath(); ctx.moveTo(x, 180); ctx.lineTo(x + 35, 90); ctx.lineTo(x + 70, 180); ctx.closePath(); ctx.fill()
  }
  // moon/sun
  ctx.fillStyle = '#e8d5a8'; ctx.beginPath(); ctx.arc(260, 40, 16, 0, Math.PI * 2); ctx.fill()
  tex.refresh()

  // near hills (parallax)
  ;({ tex, ctx } = newCanvas(scene, 'bg_near', 320, 120))
  ctx.fillStyle = '#1a2e1c'
  for (let x = -20; x < 340; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 120); ctx.lineTo(x + 25, 60); ctx.lineTo(x + 50, 120); ctx.closePath(); ctx.fill()
  }
  ctx.fillStyle = '#24401f'; ctx.fillRect(0, 100, 320, 20)
  tex.refresh()
}

function buildProps(scene) {
  // fern bush
  let { tex, ctx } = newCanvas(scene, 'prop_fern', 24 * S, 20 * S)
  rect(ctx, 10, 14, 4, 6, '#5a3a1e')
  for (const [dx, dy, h] of [[6, 4, 10], [10, 1, 13], [14, 4, 10], [3, 8, 7], [17, 8, 7]]) {
    rect(ctx, dx, dy, 2, h, '#3a6e2e'); rect(ctx, dx, dy, 1, h, '#6dbf5a')
  }
  tex.refresh()

  // rock w/ amber
  ;({ tex, ctx } = newCanvas(scene, 'prop_rock', 20 * S, 16 * S))
  rect(ctx, 3, 6, 14, 9, '#5a5e68'); rect(ctx, 3, 6, 14, 2, '#7a7e88')
  rect(ctx, 3, 13, 14, 2, '#3a3f48')
  rect(ctx, 9, 9, 3, 3, '#d97a1a'); rect(ctx, 10, 10, 1, 1, '#ffd54f')
  tex.refresh()

  // bone pile
  ;({ tex, ctx } = newCanvas(scene, 'prop_bone', 20 * S, 14 * S))
  rect(ctx, 4, 8, 12, 2, '#e8e3d3'); rect(ctx, 3, 7, 2, 4, '#cfc8b4'); rect(ctx, 15, 7, 2, 4, '#cfc8b4')
  rect(ctx, 6, 4, 2, 6, '#e8e3d3'); rect(ctx, 5, 3, 4, 2, '#cfc8b4')
  tex.refresh()

  // egg nest
  ;({ tex, ctx } = newCanvas(scene, 'prop_egg', 18 * S, 14 * S))
  rect(ctx, 2, 10, 14, 3, '#5a3a1e')
  rect(ctx, 6, 4, 6, 8, '#e8d5a8'); rect(ctx, 7, 4, 4, 2, '#f4ead0'); rect(ctx, 8, 6, 2, 2, '#fff6e0')
  tex.refresh()
}

// ---- item icon drawings (16x16 grid) ----
const ITEM_DRAW = {
  meat: (ctx, sc) => { rect(ctx, 3, 4, 9, 7, '#b03030', sc); rect(ctx, 3, 4, 9, 2, '#d85050', sc); rect(ctx, 10, 9, 4, 3, '#e8e3d3', sc) },
  berry: (ctx, sc) => { rect(ctx, 5, 6, 5, 5, '#a02050', sc); rect(ctx, 6, 6, 2, 2, '#e070a0', sc); rect(ctx, 7, 3, 2, 3, '#3a6e2e', sc) },
  egg: (ctx, sc) => { rect(ctx, 5, 4, 6, 8, '#e8d5a8', sc); rect(ctx, 6, 4, 3, 2, '#f4ead0', sc); rect(ctx, 7, 7, 2, 2, '#cfb888', sc) },
  bone: (ctx, sc) => { rect(ctx, 4, 7, 8, 2, '#e8e3d3', sc); rect(ctx, 3, 5, 2, 3, '#fff', sc); rect(ctx, 11, 5, 2, 3, '#fff', sc); rect(ctx, 3, 9, 2, 3, '#cfc8b4', sc); rect(ctx, 11, 9, 2, 3, '#cfc8b4', sc) },
  amber: (ctx, sc) => { rect(ctx, 6, 4, 4, 8, '#d97a1a', sc); rect(ctx, 7, 5, 2, 3, '#ffd54f', sc); rect(ctx, 5, 6, 1, 4, '#b0600c', sc) },
  fern: (ctx, sc) => { rect(ctx, 7, 8, 2, 5, '#5a3a1e', sc); rect(ctx, 4, 3, 2, 7, '#3a6e2e', sc); rect(ctx, 10, 3, 2, 7, '#3a6e2e', sc); rect(ctx, 7, 2, 2, 7, '#6dbf5a', sc) },
  stone: (ctx, sc) => { rect(ctx, 4, 6, 8, 6, '#6a6e78', sc); rect(ctx, 4, 6, 8, 2, '#8a8e98', sc); rect(ctx, 4, 11, 8, 1, '#4a4f58', sc) },
  claw: (ctx, sc) => { rect(ctx, 9, 3, 2, 4, '#e8e3d3', sc); rect(ctx, 7, 6, 3, 3, '#cfc8b4', sc); rect(ctx, 5, 8, 3, 3, '#b0a890', sc) },
  hide: (ctx, sc) => { rect(ctx, 3, 4, 10, 8, '#8a5a2e', sc); rect(ctx, 3, 4, 10, 2, '#a86e3a', sc); rect(ctx, 5, 7, 2, 2, '#6e4422', sc); rect(ctx, 9, 9, 2, 2, '#6e4422', sc) },
  crystal: (ctx, sc) => { rect(ctx, 6, 3, 4, 4, '#4fd6ff', sc); rect(ctx, 5, 7, 6, 4, '#3aa8d0', sc); rect(ctx, 7, 4, 1, 2, '#bff0ff', sc); rect(ctx, 7, 11, 2, 2, '#2a7898', sc) },
}
