// Original item catalogue. `icon` maps to a generated pixel texture key.

export const ITEMS = {
  meat:    { id: 'meat',    name: 'Raw Meat',     cat: 'food',     icon: 'meat',    heal: 18, value: 4 },
  berry:   { id: 'berry',   name: 'Cycad Berry',  cat: 'food',     icon: 'berry',   heal: 8,  value: 2 },
  egg:     { id: 'egg',     name: 'Dino Egg',     cat: 'special',  icon: 'egg',     value: 40 },
  bone:    { id: 'bone',    name: 'Fossil Bone',  cat: 'material', icon: 'bone',    value: 6 },
  amber:   { id: 'amber',   name: 'Amber Shard',  cat: 'material', icon: 'amber',   value: 22 },
  fern:    { id: 'fern',    name: 'Fern Bundle',  cat: 'material', icon: 'fern',    value: 3 },
  stone:   { id: 'stone',   name: 'Flint Stone',  cat: 'material', icon: 'stone',   value: 5 },
  claw:    { id: 'claw',    name: 'Raptor Claw',  cat: 'weapon',   icon: 'claw',    attack: 6, value: 30 },
  hide:    { id: 'hide',    name: 'Scaled Hide',  cat: 'material', icon: 'hide',    value: 12 },
  crystal: { id: 'crystal', name: 'Pixa Crystal', cat: 'special',  icon: 'crystal', value: 75 },
}

export const ITEM_LIST = Object.values(ITEMS)
