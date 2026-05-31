import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import WorldScene from './scenes/WorldScene.js'

export default function PhaserGame() {
  const hostRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#0d1014',
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 900 }, debug: false },
      },
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [WorldScene],
    })
    gameRef.current = game

    const onResize = () => game.scale.resize(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      game.destroy(true)
    }
  }, [])

  return <div id="game-root" ref={hostRef} style={{ position: 'absolute', inset: 0 }} />
}
