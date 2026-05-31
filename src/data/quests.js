// Original quest definitions. Progress is tracked in the store by `track` key.

export const QUESTS = [
  { id: 'q1', icon: '🥩', desc: 'Hunt 3 wild dinos for meat', track: 'kills',   goal: 3,  reward: { gold: 60,  xp: 40 } },
  { id: 'q2', icon: '🌿', desc: 'Gather 8 ferns from the valley', track: 'gather', goal: 8,  reward: { gold: 45,  xp: 30 } },
  { id: 'q3', icon: '🥚', desc: 'Find a Dino Egg in the wild',     track: 'eggs',   goal: 1,  reward: { gold: 120, xp: 80 } },
  { id: 'q4', icon: '🦴', desc: 'Collect 5 fossil bones',          track: 'bones',  goal: 5,  reward: { gold: 70,  xp: 50 } },
  { id: 'q5', icon: '🟢', desc: 'Reach level 3',                    track: 'level',  goal: 3,  reward: { gold: 200, xp: 0  } },
]
