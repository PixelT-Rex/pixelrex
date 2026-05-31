// Seed listings for the offline marketplace simulation.
const SELLERS = ['RaptorKing', 'FernQueen', 'TarPitTom', 'AmberAda', 'BoneBaron', 'EggHunter9']

export function seedMarket() {
  const offers = [
    { item: 'meat',    price: 6,  qty: 12 },
    { item: 'amber',   price: 28, qty: 3 },
    { item: 'egg',     price: 55, qty: 1 },
    { item: 'claw',    price: 40, qty: 2 },
    { item: 'crystal', price: 90, qty: 1 },
    { item: 'hide',    price: 15, qty: 8 },
    { item: 'bone',    price: 8,  qty: 20 },
    { item: 'fern',    price: 4,  qty: 30 },
  ]
  return offers.map((o, i) => ({
    id: 'm' + i,
    ...o,
    seller: SELLERS[i % SELLERS.length],
  }))
}
