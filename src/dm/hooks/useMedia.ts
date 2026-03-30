import { useState, useCallback } from 'react'
import type { MediaState } from '@shared/types'

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'])

function getFileType(filePath: string): 'image' | 'video' {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXTS.has(`.${ext}`) ? 'image' : 'video'
}

function toMediaUrl(filePath: string): string {
  // Triple-slash keeps the Windows drive letter (G:) in the path, not as URL host
  const normalized = filePath.replace(/\\/g, '/')
  return 'media:///' + normalized
}

const INITIAL_STATE: MediaState = {
  currentFile: null,
  fileType: null,
  isShowing: false,
  folderPath: '',
  files: []
}

export interface UseMediaReturn {
  media: MediaState
  openFolder: () => Promise<void>
  showFile: (filePath: string) => void
  hideMedia: () => void
  setMedia: (media: MediaState) => void
}

export function useMedia(): UseMediaReturn {
  const [media, setMediaState] = useState<MediaState>(INITIAL_STATE)

  const openFolder = useCallback(async () => {
    const folderPath = await window.electronAPI.openFolderDialog()
    if (!folderPath) return

    const files = await window.electronAPI.readMediaFolder(folderPath)
    setMediaState(prev => ({
      ...prev,
      folderPath,
      files
    }))
  }, [])

  const showFile = useCallback((filePath: string) => {
    const mediaUrl = toMediaUrl(filePath)
    setMediaState(prev => ({
      ...prev,
      currentFile: mediaUrl,
      fileType: getFileType(filePath),
      isShowing: true
    }))
  }, [])

  const hideMedia = useCallback(() => {
    setMediaState(prev => ({ ...prev, isShowing: false }))
  }, [])

  const setMedia = useCallback((media: MediaState) => {
    setMediaState(media)
  }, [])

  return { media, openFolder, showFile, hideMedia, setMedia }
}
