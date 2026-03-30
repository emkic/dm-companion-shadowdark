import { useState, useCallback } from 'react'
import { WEATHER_BY_SEASON } from '@shared/constants'
import type { LocationState, Season, DangerLevel, ActivityState, TravelMethod } from '@shared/types'
import { HEXES_PER_DAY } from '@shared/types'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function getMaxHexes(method: TravelMethod, pushing: boolean): number {
  const base = HEXES_PER_DAY[method]
  return pushing ? Math.floor(base * 1.5) : base
}

const INITIAL_STATE: LocationState = {
  name: '',
  season: 'spring',
  weather: WEATHER_BY_SEASON.spring[0],
  dangerLevel: 'unsafe',
  imagePath: '',
  showToPlayer: false,
  activity: 'traveling',
  date: todayISO(),
  showDate: false,
  travelMethod: 'walking',
  isPushing: false,
  hexesRemaining: HEXES_PER_DAY.walking,
  checklist: {
    rationsConsumed: false,
    foragingAttempt: false,
    encounterDay: false,
    encounterNight: false
  }
}

export interface UseLocationReturn {
  location: LocationState
  setName: (name: string) => void
  setSeason: (season: Season) => void
  setWeather: (weather: string) => void
  setDangerLevel: (level: DangerLevel) => void
  setImagePath: (path: string) => void
  toggleShowToPlayer: () => void
  setActivity: (activity: ActivityState) => void
  setDate: (date: string) => void
  toggleShowDate: () => void
  setTravelMethod: (method: TravelMethod) => void
  togglePushing: () => void
  spendHexes: (count: number) => void
  toggleChecklist: (key: keyof LocationState['checklist']) => void
  newDay: () => void
  setLocation: (location: LocationState) => void
}

export function useLocation(): UseLocationReturn {
  const [location, setLocationState] = useState<LocationState>(INITIAL_STATE)

  const setName = useCallback((name: string) => {
    setLocationState(prev => ({ ...prev, name }))
  }, [])

  const setSeason = useCallback((season: Season) => {
    setLocationState(prev => ({
      ...prev,
      season,
      weather: WEATHER_BY_SEASON[season][0]
    }))
  }, [])

  const setWeather = useCallback((weather: string) => {
    setLocationState(prev => ({ ...prev, weather }))
  }, [])

  const setDangerLevel = useCallback((dangerLevel: DangerLevel) => {
    setLocationState(prev => ({ ...prev, dangerLevel }))
  }, [])

  const setImagePath = useCallback((imagePath: string) => {
    setLocationState(prev => ({ ...prev, imagePath }))
  }, [])

  const toggleShowToPlayer = useCallback(() => {
    setLocationState(prev => ({ ...prev, showToPlayer: !prev.showToPlayer }))
  }, [])

  const setActivity = useCallback((activity: ActivityState) => {
    setLocationState(prev => ({ ...prev, activity }))
  }, [])

  const setDate = useCallback((date: string) => {
    setLocationState(prev => ({ ...prev, date }))
  }, [])

  const toggleShowDate = useCallback(() => {
    setLocationState(prev => ({ ...prev, showDate: !prev.showDate }))
  }, [])

  const setTravelMethod = useCallback((method: TravelMethod) => {
    setLocationState(prev => ({
      ...prev,
      travelMethod: method,
      hexesRemaining: getMaxHexes(method, prev.isPushing)
    }))
  }, [])

  const togglePushing = useCallback(() => {
    setLocationState(prev => {
      const newPushing = !prev.isPushing
      return {
        ...prev,
        isPushing: newPushing,
        hexesRemaining: getMaxHexes(prev.travelMethod, newPushing)
      }
    })
  }, [])

  const spendHexes = useCallback((count: number) => {
    setLocationState(prev => ({
      ...prev,
      hexesRemaining: Math.max(0, prev.hexesRemaining - count)
    }))
  }, [])

  const toggleChecklist = useCallback((key: keyof LocationState['checklist']) => {
    setLocationState(prev => ({
      ...prev,
      checklist: { ...prev.checklist, [key]: !prev.checklist[key] }
    }))
  }, [])

  const newDay = useCallback(() => {
    setLocationState(prev => {
      const currentDate = new Date(prev.date + 'T00:00:00')
      currentDate.setDate(currentDate.getDate() + 1)
      const nextDate = currentDate.toISOString().slice(0, 10)
      return {
        ...prev,
        date: nextDate,
        isPushing: false,
        hexesRemaining: getMaxHexes(prev.travelMethod, false),
        checklist: {
          rationsConsumed: false,
          foragingAttempt: false,
          encounterDay: false,
          encounterNight: false
        }
      }
    })
  }, [])

  const setLocation = useCallback((location: LocationState) => {
    setLocationState(location)
  }, [])

  return {
    location,
    setName,
    setSeason,
    setWeather,
    setDangerLevel,
    setImagePath,
    toggleShowToPlayer,
    setActivity,
    setDate,
    toggleShowDate,
    setTravelMethod,
    togglePushing,
    spendHexes,
    toggleChecklist,
    newDay,
    setLocation
  }
}
