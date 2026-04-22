import { useState, useCallback } from 'react'
import type { CrawlingState, CrawlingTurnSlot, DangerLevel } from '@shared/types'
import { ENCOUNTER_INTERVAL, getEffectiveDanger } from '@shared/constants'

const INITIAL_STATE: CrawlingState = {
  isActive: false,
  round: 0,
  currentTurnIndex: 0,
  turnOrder: [],
  inTotalDarkness: false,
  pendingEncounterCheck: false,
  encounterLog: [],
  encounterFlash: false
}

function isEncounterCheckRound(round: number, dangerLevel: DangerLevel, inTotalDarkness: boolean): boolean {
  if (round <= 0) return false
  return round % ENCOUNTER_INTERVAL[getEffectiveDanger(dangerLevel, inTotalDarkness)] === 0
}

export interface UseCrawlingReturn {
  crawling: CrawlingState
  setCrawlingState: (state: CrawlingState) => void
  startCrawl: (turnOrder: CrawlingTurnSlot[]) => void
  endCrawl: () => void
  nextTurn: (dangerLevel: DangerLevel) => void
  toggleTotalDarkness: () => void
  setTotalDarkness: (value: boolean) => void
  resolveEncounterCheck: (encounter: boolean) => void
  markEncounter: (round: number, encounter: boolean) => void
  dismissEncounterFlash: () => void
  setTurnName: (index: number, name: string) => void
  reorderTurns: (newOrder: CrawlingTurnSlot[]) => void
}

export function useCrawling(): UseCrawlingReturn {
  const [crawling, setCrawling] = useState<CrawlingState>(INITIAL_STATE)

  const startCrawl = useCallback((turnOrder: CrawlingTurnSlot[]) => {
    setCrawling({
      isActive: true,
      round: 1,
      currentTurnIndex: 0,
      turnOrder,
      inTotalDarkness: false,
      pendingEncounterCheck: false,
      encounterLog: [],
      encounterFlash: false
    })
  }, [])

  const endCrawl = useCallback(() => {
    setCrawling(INITIAL_STATE)
  }, [])

  const nextTurn = useCallback((dangerLevel: DangerLevel) => {
    setCrawling(prev => {
      if (prev.turnOrder.length === 0) {
        // No turn order set — just advance rounds
        const newRound = prev.round + 1
        const checked = isEncounterCheckRound(newRound, dangerLevel, prev.inTotalDarkness)
        return {
          ...prev,
          round: newRound,
          pendingEncounterCheck: checked,
          encounterFlash: false,
          encounterLog: [
            ...prev.encounterLog,
            { round: newRound, checked, encounter: false }
          ]
        }
      }

      const nextIndex = (prev.currentTurnIndex + 1) % prev.turnOrder.length
      // New round when we wrap back to the first player
      if (nextIndex === 0) {
        const newRound = prev.round + 1
        const checked = isEncounterCheckRound(newRound, dangerLevel, prev.inTotalDarkness)
        return {
          ...prev,
          // Stay on last player until encounter check is resolved
          currentTurnIndex: checked ? prev.currentTurnIndex : nextIndex,
          round: newRound,
          pendingEncounterCheck: checked,
          encounterFlash: false,
          encounterLog: [
            ...prev.encounterLog,
            { round: newRound, checked, encounter: false }
          ]
        }
      }

      return {
        ...prev,
        currentTurnIndex: nextIndex,
        encounterFlash: false
      }
    })
  }, [])

  const toggleTotalDarkness = useCallback(() => {
    setCrawling(prev => ({ ...prev, inTotalDarkness: !prev.inTotalDarkness }))
  }, [])

  const setTotalDarkness = useCallback((value: boolean) => {
    setCrawling(prev => prev.inTotalDarkness === value ? prev : { ...prev, inTotalDarkness: value })
  }, [])

  const resolveEncounterCheck = useCallback((encounter: boolean) => {
    setCrawling(prev => ({
      ...prev,
      pendingEncounterCheck: false,
      // Advance turn to first player now that the check is resolved
      currentTurnIndex: prev.turnOrder.length > 0 ? 0 : prev.currentTurnIndex,
      encounterFlash: encounter,
      encounterLog: prev.encounterLog.map(e =>
        e.round === prev.round ? { ...e, encounter } : e
      )
    }))
  }, [])

  const markEncounter = useCallback((round: number, encounter: boolean) => {
    setCrawling(prev => ({
      ...prev,
      encounterFlash: encounter,
      encounterLog: prev.encounterLog.map(e =>
        e.round === round ? { ...e, encounter } : e
      )
    }))
  }, [])

  const dismissEncounterFlash = useCallback(() => {
    setCrawling(prev => ({ ...prev, encounterFlash: false }))
  }, [])

  const setTurnName = useCallback((index: number, name: string) => {
    setCrawling(prev => ({
      ...prev,
      turnOrder: prev.turnOrder.map((slot, i) =>
        i === index ? { ...slot, name } : slot
      )
    }))
  }, [])

  const reorderTurns = useCallback((newOrder: CrawlingTurnSlot[]) => {
    setCrawling(prev => ({ ...prev, turnOrder: newOrder }))
  }, [])

  const setCrawlingState = useCallback((state: CrawlingState) => {
    setCrawling(state)
  }, [])

  return {
    crawling,
    setCrawlingState,
    startCrawl,
    endCrawl,
    nextTurn,
    toggleTotalDarkness,
    setTotalDarkness,
    resolveEncounterCheck,
    markEncounter,
    dismissEncounterFlash,
    setTurnName,
    reorderTurns
  }
}
