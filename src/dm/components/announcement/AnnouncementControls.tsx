import { useState } from 'react'
import type { UseAnnouncementReturn } from '../../hooks/useAnnouncement'
import { useRemainingSeconds } from '@shared/useRemainingSeconds'
import './AnnouncementControls.css'

interface Props {
  announcementHook: UseAnnouncementReturn
}

function formatRemaining(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`
  const min = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function AnnouncementControls({ announcementHook }: Props) {
  const { announcement, showAnnouncement, dismissAnnouncement } = announcementHook
  const [text, setText] = useState('')
  const [useTimer, setUseTimer] = useState(false)
  const [timerMin, setTimerMin] = useState('0')
  const [timerSec, setTimerSec] = useState('30')

  const remaining = useRemainingSeconds(announcement.timerEndsAt)

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    let totalSeconds: number | null = null
    if (useTimer) {
      const min = Math.max(0, parseInt(timerMin) || 0)
      const sec = Math.max(0, parseInt(timerSec) || 0)
      totalSeconds = min * 60 + sec
      if (totalSeconds <= 0) totalSeconds = 30
    }
    showAnnouncement(trimmed, totalSeconds)
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
          {remaining !== null && (
            <span className="announcement-timer-badge">{formatRemaining(remaining)}</span>
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
            <span className="announcement-timer-fields">
              <input
                type="number"
                min={0}
                max={180}
                value={timerMin}
                onChange={e => setTimerMin(e.target.value)}
                className="announcement-timer-input"
                title="Minutes"
                aria-label="Minutes"
              />
              <span className="announcement-timer-unit">min</span>
              <input
                type="number"
                min={0}
                max={59}
                value={timerSec}
                onChange={e => setTimerSec(e.target.value)}
                className="announcement-timer-input"
                title="Seconds"
                aria-label="Seconds"
              />
              <span className="announcement-timer-unit">sec</span>
            </span>
          )}
          <button className="btn btn-primary btn-small" onClick={handleSend} disabled={!text.trim()}>
            Send
          </button>
        </div>
      )}
    </div>
  )
}
