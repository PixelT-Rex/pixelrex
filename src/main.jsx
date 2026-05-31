import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// remove the static boot stub from index.html once React mounts
const boot = document.getElementById('boot')
if (boot) boot.remove()

createRoot(document.getElementById('root')).render(<App />)
