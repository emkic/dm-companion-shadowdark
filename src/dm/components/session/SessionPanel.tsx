import React, { useState, useEffect } from 'react'
import type { UseSessionReturn } from '../../hooks/useSession'
import type { AppState } from '@shared/types'
import './SessionPanel.css'

interface Props extends UseSessionReturn {
  currentState: AppState
  onLoad: (state: AppState) => void
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString()
}

export function SessionPanel({ sessions, loadSessions, saveSession, loadSession, deleteSession, currentState, onLoad }: Props) {
  const [newSessionName, setNewSessionName] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) loadSessions()
  }, [isOpen, loadSessions])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!newSessionName.trim()) return
    await saveSession(newSessionName.trim(), currentState)
    setNewSessionName('')
  }

  async function handleLoad(name: string) {
    const state = await loadSession(name)
    if (state) onLoad(state)
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
    <div className="session-panel">
      <button
        className="session-toggle btn btn-ghost btn-small"
        onClick={() => setIsOpen(o => !o)}
      >
        💾 Sessions {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div className="session-content">
          <form className="save-form" onSubmit={handleSave}>
            <input
              type="text"
              value={newSessionName}
              onChange={e => setNewSessionName(e.target.value)}
              placeholder="Session name..."
              className="form-input"
            />
            <button type="submit" className="btn btn-primary btn-small">Save</button>
          </form>

          <div className="sessions-list">
            {sessions.length === 0 && (
              <div className="empty-sessions">No saved sessions.</div>
            )}
            {sessions.map(s => (
              <div key={s.name} className="session-item">
                <div className="session-info">
                  <span className="session-name">{s.name}</span>
                  <span className="session-date">{formatDate(s.savedAt)}</span>
                </div>
                <div className="session-actions">
                  <button className="btn btn-ghost btn-small" onClick={() => handleLoad(s.name)}>
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
      )}
    </div>
  )
}
