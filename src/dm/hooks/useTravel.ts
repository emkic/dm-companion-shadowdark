import { useState, useCallback } from 'react'
import { WEATHER_BY_SEASON } from '@shared/constants'
import type { TravelState, TravelMethod, TravelMode, Season } from '@shared/types'
import { HEXES_PER_DAY } from '@shared/types'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function getMaxHexes(method: TravelMethod, pushing: boolean): number {
  const base = HEXES_PER_DAY[method]
  return pushing ? Math.floor(base * 1.5) : base
}

const INITIAL_STATE: TravelState = {
  mode: 'wilderness',
  date: todayISO(),
  travelMethod: 'walking',
  isPushing: false,
  hexesRemaining: HEXES_PER_DAY.walking,
  weather: WEATHER_BY_SEASON.spring[0],
  season: 'spring',
  checklist: {
    rationsConsumed: false,
    foragingAttempt: false,
    encounterDay: false,
    encounterNight: false
  },
  showToPlayer: false
}

export interface UseTravelReturn {
  travel: TravelState
  setMode: (mode: TravelMode) => void
  setDate: (date: string) => void
  setTravelMethod: (method: TravelMethod) => void
  togglePushing: () => void
  spendHexes: (count: number) => void
  setSeason: (season: Season) => void
  setWeather: (weather: string) => void
  toggleChecklist: (key: keyof TravelState['checklist']) => void
  toggleShowToPlayer: () => void
  newDay: () => void
  setTravelState: (state: TravelState) => void
}

export function useTravel(): UseTravelReturn {
  const [travel, setTravel] = useState<TravelState>(INITIAL_STATE)

  const setMode = useCallback((mode: TravelMode) => {
    setTravel(prev => ({ ...prev, mode }))
  }, [])

  const setDate = useCallback((date: string) => {
    setTravel(prev => ({ ...prev, date }))
  }, [])

  const setTravelMethod = useCallback((method: TravelMethod) => {
    setTravel(prev => ({
      ...prev,
      travelMethod: method,
      hexesRemaining: getMaxHexes(method, prev.isPushing)
    }))
  }, [])

  const togglePushing = useCallback(() => {
    setTravel(prev => {
      const newPushing = !prev.isPushing
      return {
        ...prev,
        isPushing: newPushing,
        hexesRemaining: getMaxHexes(prev.travelMethod, newPushing)
      }
    })
  }, [])

  const spendHexes = useCallback((count: number) => {
    setTravel(prev => ({
      ...prev,
      hexesRemaining: Math.max(0, prev.hexesRemaining - count)
    }))
  }, [])

  const setSeason = useCallback((season: Season) => {
    setTravel(prev => ({
      ...prev,
      season,
      weather: WEATHER_BY_SEASON[season][0]
    }))
  }, [])

  const setWeather = useCallback((weather: string) => {
    setTravel(prev => ({ ...prev, weather }))
  }, [])

  const toggleChecklist = useCallback((key: keyof TravelState['checklist']) => {
    setTravel(prev => ({
      ...prev,
      checklist: { ...prev.checklist, [key]: !prev.checklist[key] }
    }))
  }, [])

  const toggleShowToPlayer = useCallback(() => {
    setTravel(prev => ({ ...prev, showToPlayer: !prev.showToPlayer }))
  }, [])

  const newDay = useCallback(() => {
    setTravel(prev => {
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

  const setTravelState = useCallback((state: TravelState) => {
    setTravel(state)
  }, [])

  return {
    travel,
    setMode,
    setDate,
    setTravelMethod,
    togglePushing,
    spendHexes,
    setSeason,
    setWeather,
    toggleChecklist,
    toggleShowToPlayer,
    newDay,
    setTravelState
  }
}
