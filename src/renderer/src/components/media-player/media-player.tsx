import { useEffect } from 'react'

interface MediaFile {
  name: string
  path: string
  type: 'video' | 'image'
  duration: number
}

interface Props {
  file: MediaFile
  onEnded: () => void
  onError: () => void
}

export function MediaPlayer({ file, onEnded, onError }: Props) {
  useEffect(() => {
    if (file.type === 'image') {
      const timer = setTimeout(onEnded, file.duration)
      return () => clearTimeout(timer)
    }
    return
  }, [file])

  if (file.type === 'video') {
    return (
      <video
        key={file.path}
        src={file.path}
        autoPlay
        onEnded={onEnded}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    )
  }

  return (
    <img
      key={file.path}
      src={file.path}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      onError={onError}
    />
  )
}
