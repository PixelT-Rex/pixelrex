import { useEffect, useState } from 'react'
import { useGame } from './store.js'
import AuthScreen from './ui/AuthScreen.jsx'
import PhaserGame from './game/PhaserGame.jsx'
import Hud from './ui/Hud.jsx'

export default function App() {
  const phase = useGame((s) => s.phase)
  const bootDone = useGame((s) => s.bootDone)
  const [bootText, setBootText] = useState('Loading the Cretaceous')

  // simulated boot/loading sequence
  useEffect(() => {
    if (phase !== 'boot') return
    const steps = [
      'Loading the Cretaceous',
      'Spawning ferns and tar pits',
      'Hatching dinosaurs',
      'Calibrating the food chain',
    ]
    let i = 0
    const iv = setInterval(() => {
      i += 1
      if (i < steps.length) setBootText(steps[i])
      else { clearInterval(iv); bootDone() }
    }, 550)
    return () => clearInterval(iv)
  }, [phase, bootDone])

  if (phase === 'boot') {
    return <div className="boot-stub"><span className="boot-dots">{bootText}</span></div>
  }

  if (phase === 'auth') {
    return <AuthScreen />
  }

  return (
    <>
      <PhaserGame />
      <Hud />
    </>
  )
}
