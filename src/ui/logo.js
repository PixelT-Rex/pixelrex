// Generates an original little pixel raptor-head logo as a data URL,
// so the React UI (auth card, HUD brand) has a mark without external files.
let cached = null
export function logoDataUrl() {
  if (cached) return cached
  const S = 6
  const c = document.createElement('canvas')
  c.width = 12 * S; c.height = 12 * S
  const ctx = c.getContext('2d')
  const P = { B: '#6dbf5a', D: '#3a6e2e', b: '#cdeec8', E: '#ffd54f', C: '#e8e3d3' }
  const grid = [
    '............',
    '...DDDD.....',
    '..DBBBBD....',
    '..DBbBBD....',
    '..DBBEBD....',
    '..DBBBBDD...',
    '..DBBBBBBC..',
    '..DBbbBBCC..',
    '..DBBBBDD...',
    '...DD.DD....',
    '...C...C....',
    '............',
  ]
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const ch = grid[y][x]
      if (ch === '.') continue
      ctx.fillStyle = P[ch] || '#fff'
      ctx.fillRect(x * S, y * S, S, S)
    }
  }
  cached = c.toDataURL()
  return cached
}
