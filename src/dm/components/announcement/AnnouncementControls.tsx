import React, { useState } from 'react'
import type { UseAnnouncementReturn } from '../../hooks/useAnnouncement'
import './AnnouncementControls.css'

interface Props {
  announcementHook: UseAnnouncementReturn
}

export function AnnouncementControls({ announcementHook }: Props) {
  const { announcement, showAnnouncement, dismissAnnouncement } = announcementHook
  const [text, setText] = useState('')
  const [useTimer, setUseTimer] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState('30')

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    const timer = useTimer ? (parseInt(timerSeconds) || 30) : null
    showAnnouncement(trimmed, timer)
    setText('')
  }

  return (
    <div className="announcement-controls">
      <div className="announcement-label">Announce</div>
      {announcement.isShowing ? (
        <div className="announcement-active">
          <span className="announcement-active-text" title={announcement.text}>
            {announcement.text}
          </span>
          {announcement.timer !== null && (
            <span className="announcement-timer-badge">{announcement.timer}s</span>
          )}
          <button className="btn btn-danger btn-tiny" onClick={dismissAnnouncement}>
            Dismiss
          </button>
        </div>
      ) : (
        <div className="announcement-form">
          <input
            type="text"
            placeholder="Message for player screen..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="announcement-input"
          />
          <label className="announcement-timer-toggle" title="Auto-dismiss after timer">
            <input
              type="checkbox"
              checked={useTimer}
              onChange={e => setUseTimer(e.target.checked)}
            />
            Timer
          </label>
          {useTimer && (
            <input
              type="number"
              min={5}
              max={300}
              value={timerSeconds}
              onChange={e => setTimerSeconds(e.target.value)}
              className="announcement-timer-input"
              title="Seconds"
            />
          )}
          <button className="btn btn-primary btn-small" onClick={handleSend} disabled={!text.trim()}>
            Send
          </button>
        </div>
      )}
    </div>
  )
}
