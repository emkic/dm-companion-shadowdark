import React from 'react'

interface Props {
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function YouTubeEmbed({ containerRef }: Props) {
  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: -10000,
        top: 0,
        width: 400,
        height: 300,
        pointerEvents: 'none'
      }}
    />
  )
}
