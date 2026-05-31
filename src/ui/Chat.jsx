import { useState, useEffect, useRef } from 'react'
import { useGame } from '../store.js'

export default function Chat() {
  const chat = useGame((s) => s.chat)
  const send = useGame((s) => s.sendChat)
  const [text, setText] = useState('')
  const [open, setOpen] = useState(true)
  const feedRef = useRef(null)

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
  }, [chat, open])

  const submit = () => { send(text); setText('') }

  return (
    <div className="chat-panel">
      <div className="chat-head">
        <span className="chat-tab">Valley Chat</span>
        <button className="chat-toggle" onClick={() => setOpen((o) => !o)}>{open ? '▾' : '▸'}</button>
      </div>
      {open && (
        <>
          <div className="chat-feed" ref={feedRef}>
            {chat.map((m, i) => (
              <div className={'chat-msg' + (m.me ? ' me' : '')} key={i}>
                <span className="who">{m.name}:</span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Say something…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
            />
            <button className="chat-send" onClick={submit}>Send</button>
          </div>
        </>
      )}
    </div>
  )
}
