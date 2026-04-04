import React from 'react'

interface Props {
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function YouTubeEmbed({ containerRef }: Props) {
  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none'
      }}
    />
  )
}
