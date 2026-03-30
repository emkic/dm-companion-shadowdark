import { useState, useCallback } from 'react'
import type { CombatState, Combatant } from '@shared/types'

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

const INITIAL_STATE: CombatState = {
  isActive: false,
  round: 1,
  currentTurnIndex: 0,
  combatants: []
}

function newCombatantDefaults(): Pick<Combatant, 'isDying' | 'isDead' | 'deathTimer' | 'deathRoundsElapsed' | 'awaitingDeathTimer'> {
  return {
    isDying: false,
    isDead: false,
    deathTimer: 0,
    deathRoundsElapsed: 0,
    awaitingDeathTimer: false
  }
}

export interface UseCombatReturn {
  combat: CombatState
  addCombatant: (combatant: Omit<Combatant, 'id' | 'isDying' | 'isDead' | 'deathTimer' | 'deathRoundsElapsed' | 'awaitingDeathTimer'>) => void
  removeCombatant: (id: string) => void
  updateHP: (id: string, delta: number) => void
  setHP: (id: string, hp: number) => void
  setCombatState: (state: CombatState) => void
  setInitiative: (id: string, value: number) => void
  setEmoji: (id: string, emoji: string) => void
  sortByInitiative: () => void
  reorderCombatants: (newOrder: Combatant[]) => void
  nextTurn: () => void
  startCombat: () => void
  endCombat: () => void
  setDeathTimer: (id: string, rounds: number) => void
  rollDeathSave: (id: string, roll: number) => void
  reviveCombatant: (id: string, hp: number) => void
}

export function useCombat(): UseCombatReturn {
  const [combat, setCombat] = useState<CombatState>(INITIAL_STATE)

  const addCombatant = useCallback((data: Omit<Combatant, 'id' | 'isDying' | 'isDead' | 'deathTimer' | 'deathRoundsElapsed' | 'awaitingDeathTimer'>) => {
    const newCombatant: Combatant = {
      ...data,
      id: generateId(),
      ...newCombatantDefaults()
    }
    setCombat(prev => ({
      ...prev,
      combatants: [...prev.combatants, newCombatant]
    }))
  }, [])

  const removeCombatant = useCallback((id: string) => {
    setCombat(prev => {
      const idx = prev.combatants.findIndex(c => c.id === id)
      const newCombatants = prev.combatants.filter(c => c.id !== id)
      const newTurnIndex = idx <= prev.currentTurnIndex && prev.currentTurnIndex > 0
        ? prev.currentTurnIndex - 1
        : prev.currentTurnIndex
      return { ...prev, combatants: newCombatants, currentTurnIndex: Math.min(newTurnIndex, Math.max(0, newCombatants.length - 1)) }
    })
  }, [])

  // Apply HP change and handle dying/dead transitions
  function applyHPChange(c: Combatant, newHP: number): Combatant {
    newHP = Math.max(0, Math.min(c.maxHP, newHP))
    const wasAlive = c.currentHP > 0 && !c.isDying && !c.isDead

    // Monster hits 0 → dead, remove from active
    if (newHP <= 0 && c.type === 'monster') {
      return { ...c, currentHP: 0, isDead: true, isDying: false }
    }

    // Player hits 0 for the first time → dying, prompt for death timer
    if (newHP <= 0 && c.type === 'player' && wasAlive) {
      return {
        ...c,
        currentHP: 0,
        isDying: true,
        awaitingDeathTimer: true,
        deathTimer: 0,
        deathRoundsElapsed: 0
      }
    }

    // Player healed back above 0 while dying
    if (newHP > 0 && c.isDying) {
      return {
        ...c,
        currentHP: newHP,
        isDying: false,
        isDead: false,
        awaitingDeathTimer: false,
        deathTimer: 0,
        deathRoundsElapsed: 0
      }
    }

    return { ...c, currentHP: newHP }
  }

  const updateHP = useCallback((id: string, delta: number) => {
    setCombat(prev => ({
      ...prev,
      combatants: prev.combatants.map(c =>
        c.id === id ? applyHPChange(c, c.currentHP + delta) : c
      )
    }))
  }, [])

  const setHP = useCallback((id: string, hp: number) => {
    setCombat(prev => ({
      ...prev,
      combatants: prev.combatants.map(c =>
        c.id === id ? applyHPChange(c, hp) : c
      )
    }))
  }, [])

  const setInitiative = useCallback((id: string, value: number) => {
    setCombat(prev => ({
      ...prev,
      combatants: prev.combatants.map(c =>
        c.id === id ? { ...c, initiative: value } : c
      )
    }))
  }, [])

  const sortByInitiative = useCallback(() => {
    setCombat(prev => ({
      ...prev,
      currentTurnIndex: 0,
      combatants: [...prev.combatants].sort((a, b) => b.initiative - a.initiative)
    }))
  }, [])

  const reorderCombatants = useCallback((newOrder: Combatant[]) => {
    setCombat(prev => ({ ...prev, combatants: newOrder }))
  }, [])

  const nextTurn = useCallback(() => {
    setCombat(prev => {
      if (!prev.isActive || prev.combatants.length === 0) return prev

      // Advance death timers for all dying players
      const updatedCombatants = prev.combatants.map(c => {
        if (!c.isDying || c.isDead || c.deathTimer === 0) return c
        const newElapsed = c.deathRoundsElapsed + 1
        // Timer expired → permanently dead
        if (newElapsed >= c.deathTimer) {
          return { ...c, isDying: false, isDead: true, deathRoundsElapsed: newElapsed }
        }
        return { ...c, deathRoundsElapsed: newElapsed }
      })

      const nextIndex = (prev.currentTurnIndex + 1) % prev.combatants.length
      const newRound = nextIndex === 0 ? prev.round + 1 : prev.round

      return {
        ...prev,
        combatants: updatedCombatants,
        currentTurnIndex: nextIndex,
        round: newRound
      }
    })
  }, [])

  const startCombat = useCallback(() => {
    setCombat(prev => ({ ...prev, isActive: true, round: 1, currentTurnIndex: 0 }))
  }, [])

  const endCombat = useCallback(() => {
    setCombat(prev => ({
      ...prev,
      isActive: false,
      round: 1,
      currentTurnIndex: 0,
      combatants: prev.combatants
        .filter(c => c.type === 'player') // remove all monsters on combat end
        .map(c => ({
          ...c,
          ...newCombatantDefaults(),
          currentHP: c.isDead ? c.currentHP : c.currentHP // preserve HP but clear death state for alive players
        }))
    }))
  }, [])

  // DM rolls d4 → sets how many rounds the player has before permanent death
  const setDeathTimer = useCallback((id: string, rounds: number) => {
    setCombat(prev => ({
      ...prev,
      combatants: prev.combatants.map(c =>
        c.id === id ? { ...c, deathTimer: rounds, deathRoundsElapsed: 0, awaitingDeathTimer: false } : c
      )
    }))
  }, [])

  // DM rolls d20 each round for a dying player. Natural 20 = arise at 1 HP
  const rollDeathSave = useCallback((id: string, roll: number) => {
    setCombat(prev => ({
      ...prev,
      combatants: prev.combatants.map(c => {
        if (c.id !== id || !c.isDying) return c
        if (roll === 20) {
          return {
            ...c,
            currentHP: 1,
            isDying: false,
            isDead: false,
            deathTimer: 0,
            deathRoundsElapsed: 0,
            awaitingDeathTimer: false
          }
        }
        return c // not a 20, nothing changes — timer still ticking
      })
    }))
  }, [])

  const setEmoji = useCallback((id: string, emoji: string) => {
    setCombat(prev => ({
      ...prev,
      combatants: prev.combatants.map(c =>
        c.id === id ? { ...c, emoji } : c
      )
    }))
  }, [])

  const reviveCombatant = useCallback((id: string, hp: number) => {
    setCombat(prev => ({
      ...prev,
      combatants: prev.combatants.map(c => {
        if (c.id !== id) return c
        return {
          ...c,
          currentHP: Math.max(1, Math.min(hp, c.maxHP)),
          isDying: false,
          isDead: false,
          deathTimer: 0,
          deathRoundsElapsed: 0,
          awaitingDeathTimer: false
        }
      })
    }))
  }, [])

  const setCombatState = useCallback((state: CombatState) => {
    setCombat(state)
  }, [])

  return {
    combat,
    addCombatant,
    removeCombatant,
    updateHP,
    setHP,
    setCombatState,
    setInitiative,
    setEmoji,
    sortByInitiative,
    reorderCombatants,
    nextTurn,
    startCombat,
    endCombat,
    setDeathTimer,
    rollDeathSave,
    reviveCombatant
  }
}
