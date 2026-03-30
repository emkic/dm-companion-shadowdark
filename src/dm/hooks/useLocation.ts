import { useState, useCallback } from 'react'
import { WEATHER_BY_SEASON } from '@shared/constants'
import type { LocationState, Season, DangerLevel } from '@shared/types'

const INITIAL_STATE: LocationState = {
  name: '',
  season: 'spring',
  weather: WEATHER_BY_SEASON.spring[0],
  dangerLevel: 'unsafe',
  imagePath: '',
  showToPlayer: false
}

export interface UseLocationReturn {
  location: LocationState
  setName: (name: string) => void
  setSeason: (season: Season) => void
  setWeather: (weather: string) => void
  setDangerLevel: (level: DangerLevel) => void
  setImagePath: (path: string) => void
  toggleShowToPlayer: () => void
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
    setLocation
  }
}
