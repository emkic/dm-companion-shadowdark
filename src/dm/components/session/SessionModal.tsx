import React, { useState, useEffect } from 'react'
import type { UseSessionReturn } from '../../hooks/useSession'
import type { AppState } from '@shared/types'
import './SessionModal.css'

interface Props extends UseSessionReturn {
  currentState: AppState
  onLoad: (state: AppState) => void
  onClose: () => void
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString()
}

export function SessionModal({ sessions, loadSessions, saveSession, loadSession, deleteSession, currentState, onLoad, onClose }: Props) {
  const [newSessionName, setNewSessionName] = useState('')

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [onClose])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!newSessionName.trim()) return
    await saveSession(newSessionName.trim(), currentState)
    setNewSessionName('')
  }

  async function handleLoad(name: string) {
    const state = await loadSession(name)
    if (state) {
      onLoad(state)
      onClose()
    }
  }

  async function handleOverwrite(name: string) {
    if (confirm(`Overwrite session "${name}" with current state?`)) {
      await saveSession(name, currentState)
    }
  }

  async function handleDelete(name: string) {
    if (confirm(`Delete session "${name}"?`)) {
      await deleteSession(name)
    }
  }

  return (
    <div className="session-modal-backdrop" onClick={onClose}>
      <div className="session-modal" onClick={e => e.stopPropagation()}>
        <div className="session-modal-header">
          <h2 className="panel-title">Sessions</h2>
          <button className="btn btn-ghost btn-small" onClick={onClose}>✕</button>
        </div>

        <form className="session-save-form" onSubmit={handleSave}>
          <input
            type="text"
            value={newSessionName}
            onChange={e => setNewSessionName(e.target.value)}
            placeholder="New session name..."
            className="form-input"
            autoFocus
          />
          <button type="submit" className="btn btn-primary btn-small">Save</button>
        </form>

        <div className="session-modal-list">
          {sessions.length === 0 && (
            <div className="empty-sessions">No saved sessions.</div>
          )}
          {sessions.map(s => (
            <div key={s.name} className="session-modal-item">
              <div className="session-info">
                <span className="session-name">{s.name}</span>
                <span className="session-date">{formatDate(s.savedAt)}</span>
              </div>
              <div className="session-actions">
                <button className="btn btn-primary btn-small" onClick={() => handleLoad(s.name)}>
                  Load
                </button>
                <button className="btn btn-accent btn-small" onClick={() => handleOverwrite(s.name)}>
                  Overwrite
                </button>
                <button className="btn btn-danger btn-small" onClick={() => handleDelete(s.name)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
