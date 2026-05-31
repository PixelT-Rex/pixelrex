import Phaser from 'phaser'
import { generateTextures } from '../sprites.js'
import { DINO_BY_ID } from '../../data/dinos.js'
import { useGame } from '../../store.js'

const WORLD_W = 3600
const GROUND_Y = 520
const TILE = 32

export default class WorldScene extends Phaser.Scene {
  constructor() { super('World') }

  create() {
    generateTextures(this)
    this.buildAnims()

    this.physics.world.setBounds(0, 0, WORLD_W, 600)
    this.cameras.main.setBounds(0, 0, WORLD_W, 600)
    this.cameras.main.setBackgroundColor('#0d1014')

    // ---- parallax backdrops ----
    this.bgFar = this.add.tileSprite(0, 0, this.scale.width, 360, 'bg_far').setOrigin(0).setScrollFactor(0).setDepth(-30)
    this.bgNear = this.add.tileSprite(0, 240, this.scale.width, 240, 'bg_near').setOrigin(0).setScrollFactor(0).setDepth(-20)

    // ---- ground ----
    this.ground = this.physics.add.staticGroup()
    for (let x = 0; x < WORLD_W; x += TILE) {
      const t = this.add.image(x, GROUND_Y, 'tile_ground').setOrigin(0, 0).setDisplaySize(TILE, TILE)
      for (let y = GROUND_Y + TILE; y < 600; y += TILE) {
        this.add.image(x, y, 'tile_ground').setOrigin(0, 0).setDisplaySize(TILE, TILE).setTint(0xbbbbbb)
      }
    }
    const floor = this.add.rectangle(WORLD_W / 2, GROUND_Y + 40, WORLD_W, 80, 0x000000, 0)
    this.physics.add.existing(floor, true)
    this.groundBody = floor

    // ---- props (gatherables) ----
    this.props = this.physics.add.staticGroup()
    const propPlan = [
      ['prop_fern', 'fern', 360], ['prop_fern', 'fern', 520], ['prop_rock', 'amber', 700],
      ['prop_bone', 'bone', 980], ['prop_egg', 'egg', 1250], ['prop_fern', 'fern', 1500],
      ['prop_rock', 'amber', 1780], ['prop_bone', 'bone', 2050], ['prop_fern', 'fern', 2300],
      ['prop_egg', 'egg', 2600], ['prop_bone', 'bone', 2900], ['prop_fern', 'fern', 3150],
      ['prop_rock', 'amber', 3380],
    ]
    for (const [tex, kind, x] of propPlan) {
      const p = this.add.image(x, GROUND_Y - 2, tex).setOrigin(0.5, 1)
      p.kind = kind
      p.cooldown = 0
      this.props.add(p)
    }

    // ---- player ----
    this.player = this.physics.add.sprite(200, GROUND_Y - 60, 'dino_raptor_0')
    this.player.setOrigin(0.5, 1).setCollideWorldBounds(true)
    this.player.body.setSize(40, 44).setOffset(14, 12)
    this.applySpecies(useGame.getState().species)
    this.physics.add.collider(this.player, this.groundBody)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    // ---- wild dinos ----
    this.wild = this.physics.add.group()
    const wildPlan = [['stego', 650], ['trike', 1100], ['raptor', 1600], ['trex', 2200], ['raptor', 2750], ['stego', 3300]]
    for (const [id, x] of wildPlan) this.spawnWild(id, x)
    this.physics.add.collider(this.wild, this.groundBody)
    this.physics.add.overlap(this.player, this.wild, this.touchWild, null, this)

    // ---- input ----
    this.cursors = this.input.keyboard.createCursorKeys()
    this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,E,F')
    this.input.keyboard.on('keydown-E', () => this.tryGather())
    this.input.keyboard.on('keydown-SPACE', () => this.attack())
    this.input.keyboard.on('keydown-F', () => useGame.getState().consumeSelected())
    for (let n = 1; n <= 6; n++) {
      this.input.keyboard.on(`keydown-${['ONE','TWO','THREE','FOUR','FIVE','SIX'][n - 1]}`, () => useGame.getState().selectSlot(n - 1))
    }

    // HUD touch / button events
    window.addEventListener('pixa:species', this.onSpeciesEvent)
    window.addEventListener('pixa:action', this.onActionEvent)

    this.hurtCooldown = 0
    this.attackFlash = 0
    this.touchMove = 0
  }

  onSpeciesEvent = (e) => this.applySpecies(e.detail)
  onActionEvent = (e) => {
    const a = e.detail
    if (a === 'attack') this.attack()
    else if (a === 'gather') this.tryGather()
    else if (a === 'eat') useGame.getState().consumeSelected()
    else if (a === 'jump') this.jump()
    else if (a && a.move !== undefined) this.touchMove = a.move
  }

  buildAnims() {
    for (const id of Object.keys(DINO_BY_ID)) {
      if (!this.anims.exists(`walk_${id}`)) {
        this.anims.create({
          key: `walk_${id}`,
          frames: [{ key: `dino_${id}_0` }, { key: `dino_${id}_1` }],
          frameRate: 8, repeat: -1,
        })
      }
    }
  }

  applySpecies(id) {
    const d = DINO_BY_ID[id] || DINO_BY_ID.raptor
    this.speciesId = id
    this.speed = d.stats.speed
    this.atk = d.stats.attack
    this.player.setTexture(`dino_${id}_0`)
    this.player.play(`walk_${id}`)
    this.player.anims.pause()
  }

  spawnWild(id, x) {
    const d = DINO_BY_ID[id]
    const w = this.physics.add.sprite(x, GROUND_Y - 50, `dino_${id}_0`)
    w.setOrigin(0.5, 1)
    w.speciesId = id
    w.hp = d.stats.hp
    w.maxHp = d.stats.hp
    w.dir = Math.random() < 0.5 ? -1 : 1
    w.homeX = x
    w.play(`walk_${id}`)
    w.body.setSize(40, 40).setOffset(14, 14)
    w.setFlipX(true)
    this.wild.add(w)
    return w
  }

  attack() {
    this.attackFlash = 8
    const range = 80
    let hit = null
    this.wild.getChildren().forEach((w) => {
      if (Math.abs(w.x - this.player.x) < range && Math.abs(w.y - this.player.y) < 60) {
        if (!hit || Math.abs(w.x - this.player.x) < Math.abs(hit.x - this.player.x)) hit = w
      }
    })
    if (hit) {
      hit.hp -= this.atk + 6
      this.tweens.add({ targets: hit, alpha: 0.3, duration: 60, yoyo: true })
      hit.setVelocityX((hit.x < this.player.x ? -1 : 1) * 120)
      this.floatText(hit.x, hit.y - 60, `-${this.atk + 6}`, '#ff5252')
      if (hit.hp <= 0) {
        this.floatText(hit.x, hit.y - 70, 'DOWN', '#ffd54f')
        const px = hit.x
        hit.destroy()
        useGame.getState().onKill()
        this.time.delayedCall(6000, () => this.spawnWild(['raptor', 'stego', 'trike'][Math.floor(Math.random() * 3)], px))
      }
    }
  }

  jump() {
    if (this.player.body.blocked.down || this.player.body.touching.down) {
      this.player.setVelocityY(-430)
    }
  }

  tryGather() {
    let near = null
    this.props.getChildren().forEach((p) => {
      if (p.cooldown <= 0 && Math.abs(p.x - this.player.x) < 70) near = p
    })
    if (near) {
      useGame.getState().onGather(near.kind)
      this.floatText(near.x, near.y - 60, '+1', '#6dbf5a')
      near.cooldown = 2500
      this.tweens.add({ targets: near, y: near.y - 6, duration: 120, yoyo: true })
      near.setAlpha(0.45)
    }
  }

  touchWild(player, w) {
    if (this.hurtCooldown > 0) return
    this.hurtCooldown = 900
    const dmg = DINO_BY_ID[w.speciesId].stats.attack
    useGame.getState().damage(dmg)
    this.cameras.main.shake(120, 0.008)
    player.setVelocityX((player.x < w.x ? -1 : 1) * 220)
    player.setVelocityY(-160)
    this.floatText(player.x, player.y - 70, `-${dmg}`, '#ff5252')
  }

  floatText(x, y, text, color) {
    const t = this.add.text(x, y, text, { fontFamily: 'Courier New', fontSize: '16px', color, stroke: '#000', strokeThickness: 3 }).setOrigin(0.5)
    this.tweens.add({ targets: t, y: y - 30, alpha: 0, duration: 800, onComplete: () => t.destroy() })
  }

  update(time, delta) {
    if (!this.player) return
    const dt = delta
    if (this.hurtCooldown > 0) this.hurtCooldown -= dt
    this.props.getChildren().forEach((p) => {
      if (p.cooldown > 0) { p.cooldown -= dt; if (p.cooldown <= 0) p.setAlpha(1) }
    })

    // ---- player movement ----
    const k = this.keys
    let vx = 0
    const left = this.cursors.left.isDown || k.A.isDown || this.touchMove < -0.2
    const right = this.cursors.right.isDown || k.D.isDown || this.touchMove > 0.2
    if (left) { vx = -this.speed; this.player.setFlipX(false) }
    else if (right) { vx = this.speed; this.player.setFlipX(true) }
    this.player.setVelocityX(vx)
    if ((this.cursors.up.isDown || k.W.isDown || k.SPACE.isDown)) {
      // SPACE used for attack via keydown; W/Up jump
    }
    if (this.cursors.up.isDown || k.W.isDown) this.jump()

    const moving = Math.abs(vx) > 5
    if (moving) { if (this.player.anims.isPaused) this.player.anims.resume() }
    else { if (!this.player.anims.isPaused) this.player.anims.pause() }

    // ---- attack flash tint ----
    if (this.attackFlash > 0) { this.attackFlash -= 1; this.player.setTint(0xffffff) }
    else this.player.clearTint()

    // ---- wild AI ----
    this.wild.getChildren().forEach((w) => {
      const dxHome = w.x - w.homeX
      if (Math.abs(dxHome) > 180) w.dir = dxHome > 0 ? -1 : 1
      if (Math.random() < 0.004) w.dir *= -1
      const sp = DINO_BY_ID[w.speciesId].stats.speed * 0.4
      w.setVelocityX(w.dir * sp)
      w.setFlipX(w.dir > 0)
    })

    // ---- parallax ----
    const sx = this.cameras.main.scrollX
    this.bgFar.tilePositionX = sx * 0.15
    this.bgNear.tilePositionX = sx * 0.4

    // ---- push HP to phaser-driven respawn handled in store ----
  }

  shutdown() {
    window.removeEventListener('pixa:species', this.onSpeciesEvent)
    window.removeEventListener('pixa:action', this.onActionEvent)
  }
}
