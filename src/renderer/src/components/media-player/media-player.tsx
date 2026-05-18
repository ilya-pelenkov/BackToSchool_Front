import { useEffect, useRef, useState } from 'react'

interface MediaFile {
  name: string
  path: string
  type: 'video' | 'image'
  duration: number
}

interface MediaPlayerProps {
  file: MediaFile
  nextFile: MediaFile
  onEnded: () => void
  onError: () => void
}

const TRANSITION_DURATION_MS = 500 //ms
const TRANSITION_DURATION_SEC = TRANSITION_DURATION_MS / 1000

export function MediaPlayer({ file, nextFile, onEnded, onError }: MediaPlayerProps) {
  const [slots, setSlots] = useState<{ current: string; next: string | undefined }>({
    current: file.path,
    next: nextFile?.path,
  })
  const [showNext, setShowNext] = useState(false)
  const isFading = useRef(false)

  useEffect(() => {
    if (file.type !== 'image') return
    if (isFading.current) return
    setSlots({ current: file.path, next: nextFile?.path })
  }, [file])

  const handleFade = (): void => {
    if (isFading.current) return
    isFading.current = true
    setShowNext(true)

    setTimeout(() => {
      setSlots(s => ({ current: s.next ?? file.path, next: undefined }))
      setShowNext(false)
      isFading.current = false
      onEnded()
    }, TRANSITION_DURATION_MS)
  }

  useEffect(() => {
    if (file.type !== 'image') return
    const timer = setTimeout(handleFade, file.duration - TRANSITION_DURATION_MS)
    return () => clearTimeout(timer)
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
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        key={slots.current}
        src={slots.current}
        onError={onError}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: showNext ? 0 : 1,
          transition: `opacity ${TRANSITION_DURATION_SEC}s ease-in-out`,
        }}
      />
      {slots.next && nextFile?.type === 'image' && (
        <img
          key={slots.next}
          src={slots.next}
          onError={onError}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: showNext ? 1 : 0,
            transition: `opacity ${TRANSITION_DURATION_SEC}s ease-in-out`,
          }}
        />
      )}
    </div>
  )
}
