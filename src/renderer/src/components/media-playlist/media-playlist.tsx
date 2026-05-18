import { useEffect, useRef, useState } from 'react'

import { TMediaIpcGetFiles } from '@shared/types'

import { MediaPlayer } from '../media-player'

const IMAGE_DURATION = 5000 //TODO: получать из расписания отельным запросом к main

export function MediaPlaylist() {
  const [files, setFiles] = useState<TMediaIpcGetFiles>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const errorCountRef = useRef(0)

  useEffect(() => {
    window.api.media.getFiles().then(setFiles) //TODO: обработка ошибки
  }, [])

  const goNext = (): void => {
    setCurrentIndex(i => (i + 1) % files.length)
    errorCountRef.current = 0
  }

  const handleError = (): void => {
    errorCountRef.current += 1
    if (errorCountRef.current >= files.length) {
      console.error('Нет воспроизводимых файлов в папке cached') //TODO: продумать заглушку
      return
    }
    goNext()
  }

  if (!files.length) return <p>Нет файлов в папке cached</p> //TODO: продумать заглушку

  return (
    <MediaPlayer
      file={{ ...files[currentIndex], duration: IMAGE_DURATION }}
      nextFile={{ ...files[(currentIndex + 1) % files.length], duration: IMAGE_DURATION }}
      onEnded={goNext}
      onError={handleError}
    />
  )
}
