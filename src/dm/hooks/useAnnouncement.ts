import { useState, useCallback, useEffect, useRef } from 'react'
import type { AnnouncementState } from '@shared/types'

const INITIAL_STATE: AnnouncementState = {
  text: '',
  isShowing: false,
  timer: null
}

export interface UseAnnouncementReturn {
  announcement: AnnouncementState
  showAnnouncement: (text: string, timerSeconds: number | null) => void
  dismissAnnouncement: () => void
}

export function useAnnouncement(): UseAnnouncementReturn {
  const [announcement, setAnnouncement] = useState<AnnouncementState>(INITIAL_STATE)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clear any running timer
  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const showAnnouncement = useCallback((text: string, timerSeconds: number | null) => {
    clearTimer()
    setAnnouncement({ text, isShowing: true, timer: timerSeconds })
  }, [])

  const dismissAnnouncement = useCallback(() => {
    clearTimer()
    setAnnouncement(INITIAL_STATE)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!announcement.isShowing || announcement.timer === null || announcement.timer <= 0) {
      if (announcement.timer === 0) {
        dismissAnnouncement()
      }
      return
    }

    timerRef.current = setInterval(() => {
      setAnnouncement(prev => {
        if (prev.timer === null || prev.timer <= 1) {
          return { ...prev, timer: 0 }
        }
        return { ...prev, timer: prev.timer - 1 }
      })
    }, 1000)

    return () => clearTimer()
  }, [announcement.isShowing, announcement.timer === null, announcement.timer === 0])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer()
  }, [])

  return { announcement, showAnnouncement, dismissAnnouncement }
}
