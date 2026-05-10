import { useState, useCallback, useEffect } from 'react'
import type { AnnouncementState } from '@shared/types'

const INITIAL_STATE: AnnouncementState = {
  text: '',
  isShowing: false,
  timerEndsAt: null
}

export interface UseAnnouncementReturn {
  announcement: AnnouncementState
  showAnnouncement: (text: string, totalSeconds: number | null) => void
  dismissAnnouncement: () => void
}

export function useAnnouncement(): UseAnnouncementReturn {
  const [announcement, setAnnouncement] = useState<AnnouncementState>(INITIAL_STATE)

  const showAnnouncement = useCallback((text: string, totalSeconds: number | null) => {
    const timerEndsAt =
      totalSeconds !== null && totalSeconds > 0 ? Date.now() + totalSeconds * 1000 : null
    setAnnouncement({ text, isShowing: true, timerEndsAt })
  }, [])

  const dismissAnnouncement = useCallback(() => {
    setAnnouncement(INITIAL_STATE)
  }, [])

  // Auto-dismiss when the deadline is reached. Uses a single setTimeout against
  // the absolute deadline rather than ticking every second, so we don't depend
  // on the DM window staying focused. If the window is throttled while hidden,
  // the dismiss may be delayed a bit — but the player's displayed countdown is
  // independent and stays accurate.
  useEffect(() => {
    if (!announcement.isShowing || announcement.timerEndsAt === null) return
    const remainingMs = announcement.timerEndsAt - Date.now()
    if (remainingMs <= 0) {
      dismissAnnouncement()
      return
    }
    const id = setTimeout(dismissAnnouncement, remainingMs)
    return () => clearTimeout(id)
  }, [announcement.isShowing, announcement.timerEndsAt, dismissAnnouncement])

  return { announcement, showAnnouncement, dismissAnnouncement }
}
