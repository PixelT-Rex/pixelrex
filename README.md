# 🦖 PixelRex — Dino World

A pixel-art dinosaur survival sandbox set in a side-scrolling Cretaceous valley.
Pick one of six dinosaur species, then hunt wild dinos, gather resources, trade
on the marketplace, complete quests and level up your beast.

Built with **Vite + React + Phaser**. Single-player demo build — all of the
pixel art is generated procedurally at runtime, with no external image assets.

## ✨ Features
- 🌋 Side-scrolling open valley with parallax backdrops, day cycle & roaming wild dinos
- ⚔️ Real-time combat, gathering, health & XP / skill progression
- 🦕 6 playable species (free + premium) with unique stats
- 🛒 Marketplace, inventory, quests, skills & a rewards leaderboard
- 🟢 **Login** flow (stands in for wallet connect) — unlocks the PIXA balance and premium dinos
- 🎨 Original pixel sprites generated entirely in code

## 🚀 Run locally
```bash
npm install
npm run dev   # http://localhost:5173
```

Build for production:
```bash
npm run build
npm run preview
```

## 🎮 Controls
| Key | Action |
| --- | --- |
| `A` / `D` or `←` / `→` | Move |
| `W` / `↑` | Jump |
| `Space` | Attack nearby dinos |
| `E` | Gather from ferns, rocks, bones & nests |
| `F` | Eat selected hotbar food to heal |
| `1`–`6` | Select hotbar slot |

## 🗂️ Project structure
```
src/
  store.js          # global game state (zustand) — login replaces wallet connect
  App.jsx           # boot → login → game flow
  ui/               # AuthScreen, HUD, panels, chat, icon generators
  game/             # Phaser game mount + world scene + procedural sprites
  data/             # dinos, items, quests, market seed data
tools/
  make-brand.mjs    # generates the X avatar + banner brand art
```

## 📝 Notes
This is a single-player demo. The online count, chat and PIXA/Gold balances are
simulated locally — the **Login** button takes the place of a wallet connect and
grants the equivalent "connected" state (address, PIXA, premium access).

---
*Original project — code and pixel art are generated from scratch.*
