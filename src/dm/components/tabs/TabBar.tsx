import React from 'react'
import './TabBar.css'

export interface TabDef {
  id: string
  label: string
  icon: string
  badge?: string | number | null
  badgeColor?: string
}

interface Props {
  tabs: TabDef[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function TabBar({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="tab-bar">
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'tab-active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          title={`${tab.label} (${i + 1})`}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
          {tab.badge != null && (
            <span
              className="tab-badge"
              style={tab.badgeColor ? { color: tab.badgeColor, borderColor: tab.badgeColor, background: `${tab.badgeColor}20` } : undefined}
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
      <div className="tab-bar-hint">
        Press 1-{tabs.length} to switch tabs
      </div>
    </div>
  )
}
