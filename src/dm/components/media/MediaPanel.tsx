import { useEffect, useRef, useState } from 'react'
import type { UseMediaReturn } from '../../hooks/useMedia'
import type { UseAmbianceReturn } from '../../hooks/useAmbiance'
import { AmbiancePlayer } from '../ambiance/AmbiancePlayer'
import './MediaPanel.css'

function getFileName(filePath: string): string {
  return filePath.split(/[\\/]/).pop() ?? filePath
}

function isVideo(filePath: string): boolean {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  return ['mp4', 'webm', 'mov', 'mkv'].includes(ext)
}

function VideoThumb({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el || visible) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  return (
    <video
      ref={videoRef}
      src={visible ? src : undefined}
      preload="metadata"
      muted
      playsInline
      onError={e => { (e.target as HTMLVideoElement).style.display = 'none' }}
    />
  )
}

type Props = UseMediaReturn & { ambianceHook: UseAmbianceReturn }

export function MediaPanel({ media, openFolder, showFile, hideMedia, ambianceHook }: Props) {
  return (
    <div className="media-panel">
      <div className="media-header">
        <h2 className="panel-title">Media</h2>
        <div className="media-header-controls">
          <button className="btn btn-ghost btn-small" onClick={openFolder}>
            📁 Browse Folder
          </button>
          {media.isShowing && (
            <button className="btn btn-secondary btn-small" onClick={hideMedia}>
              ✕ Hide
            </button>
          )}
        </div>
      </div>

      {media.folderPath && (
        <div className="folder-path">{media.folderPath}</div>
      )}

      {media.isShowing && media.currentFile && (
        <div className="now-showing">
          <span className="now-showing-label">Showing:</span>
          <span className="now-showing-file">{getFileName(media.currentFile)}</span>
        </div>
      )}

      <div className="media-grid">
        {media.files.map(filePath => {
          const name = getFileName(filePath)
          const video = isVideo(filePath)
          const mediaUrl = `media:///${filePath.replace(/\\/g, '/')}`
          const isActive = media.currentFile === mediaUrl && media.isShowing

          return (
            <div
              key={filePath}
              className={`media-item ${isActive ? 'active' : ''}`}
              onClick={() => showFile(filePath)}
              title={name}
            >
              {video ? (
                <div className="media-thumb video-thumb">
                  <VideoThumb src={mediaUrl} />
                  <span className="video-icon">▶</span>
                  <span className="media-name">{name}</span>
                </div>
              ) : (
                <div className="media-thumb image-thumb">
                  <img
                    src={mediaUrl}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <span className="media-name">{name}</span>
                </div>
              )}
            </div>
          )
        })}
        {media.files.length === 0 && (
          <div className="empty-media">
            {media.folderPath ? 'No images or videos found.' : 'Open a folder to browse media.'}
          </div>
        )}
      </div>

      <div className="media-divider" />

      <AmbiancePlayer ambianceHook={ambianceHook} />
    </div>
  )
}
