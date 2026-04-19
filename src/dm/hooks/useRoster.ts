import { useState, useCallback, useEffect } from 'react'
import type { RosterPlayer, Party } from '@shared/types'

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export interface UseRosterReturn {
  parties: Party[]
  activePartyId: string | null
  activeParty: Party | null
  setActivePartyId: (id: string | null) => void
  addParty: (name: string) => void
  renameParty: (id: string, name: string) => void
  deleteParty: (id: string) => void
  addToRoster: (player: Omit<RosterPlayer, 'id'>) => void
  removeFromRoster: (playerId: string) => void
  updateRosterPlayer: (playerId: string, updates: Partial<Omit<RosterPlayer, 'id'>>) => void
}

export function useRoster(): UseRosterReturn {
  const [parties, setParties] = useState<Party[]>([])
  const [activePartyId, setActivePartyId] = useState<string | null>(null)

  // Load parties from disk on mount
  useEffect(() => {
    window.electronAPI.loadParties().then(loaded => {
      setParties(loaded)
      if (loaded.length > 0) {
        setActivePartyId(loaded[0].id)
      }
    })
  }, [])

  const activeParty = parties.find(p => p.id === activePartyId) ?? null

  function persist(updated: Party[]) {
    setParties(updated)
    window.electronAPI.saveParties(updated)
  }

  const addParty = useCallback((name: string) => {
    const newParty: Party = { id: generateId(), name, players: [] }
    setParties(prev => {
      const updated = [...prev, newParty]
      window.electronAPI.saveParties(updated)
      return updated
    })
    setActivePartyId(newParty.id)
  }, [])

  const renameParty = useCallback((id: string, name: string) => {
    setParties(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, name } : p)
      window.electronAPI.saveParties(updated)
      return updated
    })
  }, [])

  const deleteParty = useCallback((id: string) => {
    setParties(prev => {
      const updated = prev.filter(p => p.id !== id)
      window.electronAPI.saveParties(updated)
      return updated
    })
    setActivePartyId(prev => prev === id ? null : prev)
  }, [])

  const addToRoster = useCallback((player: Omit<RosterPlayer, 'id'>) => {
    if (!activePartyId) return
    setParties(prev => {
      const updated = prev.map(p =>
        p.id === activePartyId
          ? { ...p, players: [...p.players, { ...player, id: generateId() }] }
          : p
      )
      window.electronAPI.saveParties(updated)
      return updated
    })
  }, [activePartyId])

  const removeFromRoster = useCallback((playerId: string) => {
    if (!activePartyId) return
    setParties(prev => {
      const updated = prev.map(p =>
        p.id === activePartyId
          ? { ...p, players: p.players.filter(pl => pl.id !== playerId) }
          : p
      )
      window.electronAPI.saveParties(updated)
      return updated
    })
  }, [activePartyId])

  const updateRosterPlayer = useCallback((playerId: string, updates: Partial<Omit<RosterPlayer, 'id'>>) => {
    if (!activePartyId) return
    setParties(prev => {
      const updated = prev.map(p =>
        p.id === activePartyId
          ? { ...p, players: p.players.map(pl => pl.id === playerId ? { ...pl, ...updates } : pl) }
          : p
      )
      window.electronAPI.saveParties(updated)
      return updated
    })
  }, [activePartyId])

  return {
    parties,
    activePartyId,
    activeParty,
    setActivePartyId,
    addParty,
    renameParty,
    deleteParty,
    addToRoster,
    removeFromRoster,
    updateRosterPlayer
  }
}
