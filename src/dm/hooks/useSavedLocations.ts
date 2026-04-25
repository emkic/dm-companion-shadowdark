import { useState, useCallback, useEffect } from 'react'
import type { SavedLocation } from '@shared/types'

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export interface UseSavedLocationsReturn {
  savedLocations: SavedLocation[]
  addSavedLocation: (location: Omit<SavedLocation, 'id'>) => SavedLocation
  updateSavedLocation: (id: string, updates: Partial<Omit<SavedLocation, 'id'>>) => void
  deleteSavedLocation: (id: string) => void
}

export function useSavedLocations(): UseSavedLocationsReturn {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])

  useEffect(() => {
    window.electronAPI.loadSavedLocations().then(loaded => {
      setSavedLocations(loaded)
    })
  }, [])

  const addSavedLocation = useCallback((location: Omit<SavedLocation, 'id'>): SavedLocation => {
    const created: SavedLocation = { ...location, id: generateId() }
    setSavedLocations(prev => {
      const updated = [...prev, created]
      window.electronAPI.saveSavedLocations(updated)
      return updated
    })
    return created
  }, [])

  const updateSavedLocation = useCallback((id: string, updates: Partial<Omit<SavedLocation, 'id'>>) => {
    setSavedLocations(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, ...updates } : l)
      window.electronAPI.saveSavedLocations(updated)
      return updated
    })
  }, [])

  const deleteSavedLocation = useCallback((id: string) => {
    setSavedLocations(prev => {
      const updated = prev.filter(l => l.id !== id)
      window.electronAPI.saveSavedLocations(updated)
      return updated
    })
  }, [])

  return {
    savedLocations,
    addSavedLocation,
    updateSavedLocation,
    deleteSavedLocation
  }
}
