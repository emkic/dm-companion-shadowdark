import type { AnnouncementState } from '@shared/types'
import './PlayerAnnouncement.css'

interface Props {
  announcement: AnnouncementState
}

export function PlayerAnnouncement({ announcement }: Props) {
  if (!announcement.isShowing || !announcement.text) return null

  return (
    <div className="player-announcement">
      <div className="player-announcement-text">{announcement.text}</div>
      {announcement.timer !== null && (
        <div className="player-announcement-timer">{announcement.timer}s</div>
      )}
    </div>
  )
}
