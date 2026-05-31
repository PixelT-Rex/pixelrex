// Original dinosaur species roster. Each entry drives sprite generation + stats.
// `palette` indexes are referenced by src/game/sprites.js pixel maps.

export const DINOS = [
  {
    id: 'raptor',
    name: 'Velo Raptor',
    desc: 'Swift pack hunter. Fast movement, light hits.',
    tier: 'free',
    price: 0,
    stats: { hp: 90, speed: 220, attack: 12 },
    palette: { body: '#6dbf5a', belly: '#cdeec8', dark: '#3a6e2e', eye: '#ffd54f', claw: '#e8e3d3' },
  },
  {
    id: 'stego',
    name: 'Stegosaur',
    desc: 'Armoured grazer. Slow but tanky, great at gathering.',
    tier: 'free',
    price: 0,
    stats: { hp: 160, speed: 130, attack: 9 },
    palette: { body: '#5a8fb0', belly: '#bfe2f0', dark: '#2f5870', eye: '#ffd54f', claw: '#e8d5a8' },
  },
  {
    id: 'trike',
    name: 'Triceratops',
    desc: 'Three-horned charger. Balanced bruiser.',
    tier: 'free',
    price: 0,
    stats: { hp: 140, speed: 150, attack: 14 },
    palette: { body: '#b07a4a', belly: '#e8cfa8', dark: '#6e4626', eye: '#ffd54f', claw: '#f0e6d0' },
  },
  {
    id: 'trex',
    name: 'Tyranno Rex',
    desc: 'Apex predator. Heavy attacks, premium beast.',
    tier: 'premium',
    price: 1200,
    stats: { hp: 200, speed: 170, attack: 24 },
    palette: { body: '#7a5cc0', belly: '#d8c8f0', dark: '#46306e', eye: '#ff5252', claw: '#f0e6d0' },
  },
  {
    id: 'ptero',
    name: 'Pteranodon',
    desc: 'Winged glider. Hard to catch, premium beast.',
    tier: 'premium',
    price: 900,
    stats: { hp: 100, speed: 240, attack: 16 },
    palette: { body: '#d97a3a', belly: '#f0d0a8', dark: '#8a4620', eye: '#4fd6ff', claw: '#f0e6d0' },
  },
  {
    id: 'bronto',
    name: 'Brontogiant',
    desc: 'Colossal long-neck. Walking fortress, premium beast.',
    tier: 'premium',
    price: 1500,
    stats: { hp: 260, speed: 110, attack: 18 },
    palette: { body: '#4aa890', belly: '#bfeede', dark: '#2a6e5c', eye: '#ffd54f', claw: '#f0e6d0' },
  },
]

export const DINO_BY_ID = Object.fromEntries(DINOS.map((d) => [d.id, d]))
