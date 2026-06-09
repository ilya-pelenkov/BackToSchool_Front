import { useEffect, useRef, useState } from 'react'

import { TMediaIpcGetFiles } from '@shared/types'

import { MediaPlayer } from '../media-player'
import { Modal, QrButton } from '../ui'

export function MediaPlaylist() {
  const [files, setFiles] = useState<TMediaIpcGetFiles>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const errorCountRef = useRef(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadFiles = (): void => {
    window.api.media.getFiles().then(setFiles) //TODO: обработка ошибки
  }

  useEffect(() => {
    loadFiles()
    const unsubscribe = window.api.media.onUpdated(loadFiles)
    return unsubscribe
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

  const openModal = (): void => {
    setIsPaused(true)
    setIsModalOpen(true)
  }

  const closeModal = (): void => {
    setIsPaused(false)
    setIsModalOpen(false)
  }

  if (!files.length) return <p>Нет файлов для воспроизведения</p> //TODO: продумать заглушку
  const currentFile = files[currentIndex]
  const nextFile = files[(currentIndex + 1) % files.length]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MediaPlayer file={currentFile} nextFile={nextFile} onEnded={goNext} onError={handleError} isPaused={isPaused} />
      <QrButton onClick={openModal} content={'QR'} />
      {isModalOpen && (
        <Modal onClose={closeModal}>
          {currentFile.qr_code_base64 ? (
            <img
              src={`data:image/svg+xml;base64,${currentFile.qr_code_base64}`}
              alt="QR код"
              style={{ width: 240, height: 240 }}
            />
          ) : (
            <p>QR код недоступен</p>
          )}
        </Modal>
      )}
    </div>
  )
}
