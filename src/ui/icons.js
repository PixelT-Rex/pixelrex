// React-side data-URL versions of the original pixel art (items + dino thumbs)
// so HUD/panels can render the same sprites outside the Phaser canvas.
import { DINO_BY_ID } from '../data/dinos.js'

const itemCache = {}
const dinoCache = {}

function px(ctx, x, y, w, h, color, s) { ctx.fillStyle = color; ctx.fillRect(x * s, y * s, w * s, h * s) }

const ITEM_DRAW = {
  meat: (c, s) => { px(c, 3, 4, 9, 7, '#b03030', s); px(c, 3, 4, 9, 2, '#d85050', s); px(c, 10, 9, 4, 3, '#e8e3d3', s) },
  berry: (c, s) => { px(c, 5, 6, 5, 5, '#a02050', s); px(c, 6, 6, 2, 2, '#e070a0', s); px(c, 7, 3, 2, 3, '#3a6e2e', s) },
  egg: (c, s) => { px(c, 5, 4, 6, 8, '#e8d5a8', s); px(c, 6, 4, 3, 2, '#f4ead0', s); px(c, 7, 7, 2, 2, '#cfb888', s) },
  bone: (c, s) => { px(c, 4, 7, 8, 2, '#e8e3d3', s); px(c, 3, 5, 2, 3, '#fff', s); px(c, 11, 5, 2, 3, '#fff', s); px(c, 3, 9, 2, 3, '#cfc8b4', s); px(c, 11, 9, 2, 3, '#cfc8b4', s) },
  amber: (c, s) => { px(c, 6, 4, 4, 8, '#d97a1a', s); px(c, 7, 5, 2, 3, '#ffd54f', s); px(c, 5, 6, 1, 4, '#b0600c', s) },
  fern: (c, s) => { px(c, 7, 8, 2, 5, '#5a3a1e', s); px(c, 4, 3, 2, 7, '#3a6e2e', s); px(c, 10, 3, 2, 7, '#3a6e2e', s); px(c, 7, 2, 2, 7, '#6dbf5a', s) },
  stone: (c, s) => { px(c, 4, 6, 8, 6, '#6a6e78', s); px(c, 4, 6, 8, 2, '#8a8e98', s); px(c, 4, 11, 8, 1, '#4a4f58', s) },
  claw: (c, s) => { px(c, 9, 3, 2, 4, '#e8e3d3', s); px(c, 7, 6, 3, 3, '#cfc8b4', s); px(c, 5, 8, 3, 3, '#b0a890', s) },
  hide: (c, s) => { px(c, 3, 4, 10, 8, '#8a5a2e', s); px(c, 3, 4, 10, 2, '#a86e3a', s); px(c, 5, 7, 2, 2, '#6e4422', s); px(c, 9, 9, 2, 2, '#6e4422', s) },
  crystal: (c, s) => { px(c, 6, 3, 4, 4, '#4fd6ff', s); px(c, 5, 7, 6, 4, '#3aa8d0', s); px(c, 7, 4, 1, 2, '#bff0ff', s); px(c, 7, 11, 2, 2, '#2a7898', s) },
}

export function itemIcon(id) {
  if (itemCache[id]) return itemCache[id]
  const fn = ITEM_DRAW[id]
  const s = 3
  const c = document.createElement('canvas')
  c.width = 16 * s; c.height = 16 * s
  const ctx = c.getContext('2d')
  if (fn) fn(ctx, s)
  return (itemCache[id] = c.toDataURL())
}

// ---- dino thumbnails (mirrors src/game/sprites.js silhouettes) ----
const S = 5
function drawBiped(c, p) {
  px(c, 0, 7, 2, 2, p.dark, S); px(c, 1, 6, 3, 3, p.body, S); px(c, 3, 5, 3, 4, p.body, S)
  px(c, 5, 4, 8, 6, p.body, S); px(c, 5, 8, 8, 1, p.dark, S); px(c, 6, 7, 6, 2, p.belly, S)
  px(c, 12, 2, 4, 4, p.body, S); px(c, 15, 3, 2, 3, p.body, S); px(c, 16, 4, 1, 2, p.claw, S)
  px(c, 14, 3, 1, 1, p.eye, S); px(c, 12, 1, 3, 1, p.dark, S); px(c, 11, 8, 2, 1, p.dark, S)
  px(c, 6, 10, 2, 3, p.dark, S); px(c, 5, 12, 3, 1, p.claw, S); px(c, 10, 10, 2, 2, p.dark, S); px(c, 10, 11, 3, 1, p.claw, S)
}
function drawQuad(c, p) {
  px(c, 2, 5, 12, 5, p.body, S); px(c, 2, 9, 12, 1, p.dark, S); px(c, 3, 8, 10, 1, p.belly, S)
  px(c, 4, 3, 2, 2, p.dark, S); px(c, 7, 2, 2, 3, p.dark, S); px(c, 10, 3, 2, 2, p.dark, S); px(c, 0, 6, 2, 2, p.body, S)
  px(c, 13, 4, 3, 3, p.body, S); px(c, 15, 5, 2, 2, p.body, S); px(c, 15, 4, 1, 1, p.eye, S)
  px(c, 3, 10, 2, 3, p.dark, S); px(c, 11, 10, 2, 2, p.dark, S); px(c, 6, 10, 2, 2, p.dark, S); px(c, 9, 10, 2, 3, p.dark, S)
  px(c, 3, 12, 2, 1, p.claw, S); px(c, 9, 12, 2, 1, p.claw, S)
}
function drawFlyer(c, p) {
  px(c, 6, 6, 5, 3, p.body, S); px(c, 6, 8, 5, 1, p.dark, S)
  px(c, 10, 4, 3, 3, p.body, S); px(c, 13, 5, 2, 1, p.claw, S); px(c, 11, 5, 1, 1, p.eye, S); px(c, 9, 3, 2, 1, p.dark, S)
  px(c, 1, 4, 6, 2, p.body, S); px(c, 1, 6, 4, 1, p.belly, S); px(c, 10, 4, 6, 2, p.body, S)
  px(c, 7, 9, 1, 2, p.dark, S); px(c, 9, 9, 1, 2, p.dark, S)
}
const BODY = { raptor: drawBiped, trex: drawBiped, stego: drawQuad, trike: drawQuad, bronto: drawQuad, ptero: drawFlyer }

export function dinoThumb(id) {
  if (dinoCache[id]) return dinoCache[id]
  const d = DINO_BY_ID[id]
  const c = document.createElement('canvas')
  c.width = 18 * S; c.height = 14 * S
  const ctx = c.getContext('2d')
  ;(BODY[id] || drawBiped)(ctx, d.palette)
  return (dinoCache[id] = c.toDataURL())
}
