import type { AnnouncementState } from '@shared/types'
import { useRemainingSeconds } from '@shared/useRemainingSeconds'
import './PlayerAnnouncement.css'

interface Props {
  announcement: AnnouncementState
}

function formatRemaining(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`
  const min = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function PlayerAnnouncement({ announcement }: Props) {
  const remaining = useRemainingSeconds(announcement.timerEndsAt)
  if (!announcement.isShowing || !announcement.text) return null

  return (
    <div className="player-announcement">
      <div className="player-announcement-text">{announcement.text}</div>
      {remaining !== null && (
        <div className="player-announcement-timer">{formatRemaining(remaining)}</div>
      )}
    </div>
  )
}
