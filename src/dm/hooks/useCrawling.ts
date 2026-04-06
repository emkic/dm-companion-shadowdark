import { useState, useCallback } from 'react'
import type { CrawlingState, CrawlingTurnSlot, DangerLevel } from '@shared/types'

const INITIAL_STATE: CrawlingState = {
  isActive: false,
  round: 0,
  currentTurnIndex: 0,
  turnOrder: [],
  inTotalDarkness: false,
  encounterLog: [],
  encounterFlash: false
}

/** How often to check for random encounters based on danger level */
const ENCOUNTER_INTERVAL: Record<DangerLevel, number> = {
  unsafe: 3,
  risky: 2,
  deadly: 1
}

function isEncounterCheckRound(round: number, dangerLevel: DangerLevel, inTotalDarkness: boolean): boolean {
  if (round <= 0) return false
  const effective = inTotalDarkness ? 'deadly' : dangerLevel
  return round % ENCOUNTER_INTERVAL[effective] === 0
}

export interface UseCrawlingReturn {
  crawling: CrawlingState
  setCrawlingState: (state: CrawlingState) => void
  startCrawl: (turnOrder: CrawlingTurnSlot[]) => void
  endCrawl: () => void
  nextTurn: (dangerLevel: DangerLevel) => void
  toggleTotalDarkness: () => void
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
          currentTurnIndex: nextIndex,
          round: newRound,
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
    markEncounter,
    dismissEncounterFlash,
    setTurnName,
    reorderTurns
  }
}
