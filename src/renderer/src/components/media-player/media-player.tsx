import { useCallback, useEffect, useRef, useState } from 'react'

import { TMediaFile } from '@shared/types/ipc'

import { logError } from '@renderer/utils'

interface MediaPlayerProps {
  file: TMediaFile
  nextFile: TMediaFile
  onEnded: () => void
  onError: () => void
  isPaused: boolean
}

const TRANSITION_DURATION_MS = 500
const TRANSITION_DURATION_SEC = TRANSITION_DURATION_MS / 1000

export function MediaPlayer({ file, nextFile, onEnded, onError, isPaused }: MediaPlayerProps) {
  const [slots, setSlots] = useState<{ current: string; next: string | undefined }>({
    current: file.path,
    next: nextFile?.path,
  })
  const [showNext, setShowNext] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isFading = useRef(false)
  const remainingMsRef = useRef<number>(0)
  const startedAtRef = useRef<number>(0)
  const lastPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (file.type !== 'banner') return
    if (isFading.current) return
    setSlots({ current: file.path, next: nextFile?.path })
  }, [file, nextFile?.path])

  const handleFade = useCallback((): void => {
    if (isFading.current) return
    isFading.current = true
    setShowNext(true)

    setTimeout(() => {
      setSlots(s => ({ current: s.next ?? file.path, next: undefined }))
      setShowNext(false)
      isFading.current = false
      onEnded()
    }, TRANSITION_DURATION_MS)
  }, [file.path, onEnded])

  /* для банера **/
  useEffect(() => {
    if (file.type !== 'banner') return

    // новый банер — считаем таймер с начала
    if (lastPathRef.current !== file.path) {
      lastPathRef.current = file.path
      remainingMsRef.current = file.duration * 1000 - TRANSITION_DURATION_MS
    }

    if (isPaused) return

    startedAtRef.current = Date.now()
    const delay = Math.max(remainingMsRef.current, 0)
    const timer = setTimeout(handleFade, delay)

    return () => {
      clearTimeout(timer)
      remainingMsRef.current -= Date.now() - startedAtRef.current
    }
  }, [file.path, file.duration, file.type, isPaused, handleFade])

  const onErrorWithLog = e => {
    logError(e.target.error)
    onError()
  }

  /* для видео **/
  useEffect(() => {
    if (!videoRef.current) return
    if (isPaused) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }, [isPaused])

  if (file.type === 'video') {
    return (
      <video
        key={file.path}
        src={file.path}
        ref={videoRef}
        autoPlay
        onEnded={onEnded}
        onError={onErrorWithLog}
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
        onError={onErrorWithLog}
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
      {slots.next && nextFile?.type === 'banner' && (
        <img
          key={slots.next}
          src={slots.next}
          onError={onErrorWithLog}
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
