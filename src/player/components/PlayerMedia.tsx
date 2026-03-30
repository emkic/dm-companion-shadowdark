import React, { useEffect, useRef } from 'react'
import type { MediaState, LocationState } from '@shared/types'
import './PlayerMedia.css'

interface Props {
  media: MediaState
  location: LocationState
}

export function PlayerMedia({ media, location }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Location image overrides media when showToPlayer is on
  const showLocationBg = location.showToPlayer && location.imagePath
  const locationImgUrl = showLocationBg
    ? `media:///${location.imagePath.replace(/\\/g, '/')}`
    : null

  useEffect(() => {
    if (videoRef.current && !showLocationBg && media.isShowing && media.fileType === 'video') {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [media.currentFile, media.isShowing, media.fileType, showLocationBg])

  if (showLocationBg) {
    return (
      <div className="player-media">
        <img
          key={locationImgUrl!}
          src={locationImgUrl!}
          alt=""
          className="player-media-img"
        />
      </div>
    )
  }

  if (!media.isShowing || !media.currentFile) {
    return <div className="player-media player-media-empty" />
  }

  return (
    <div className="player-media">
      {media.fileType === 'image' && (
        <img
          key={media.currentFile}
          src={media.currentFile}
          alt=""
          className="player-media-img"
        />
      )}
      {media.fileType === 'video' && (
        <video
          key={media.currentFile}
          ref={videoRef}
          src={media.currentFile}
          className="player-media-video"
          autoPlay
          loop
          muted
          playsInline
        />
      )}
    </div>
  )
}
