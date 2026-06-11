import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { TMediaIpcGetFiles } from '@shared/types'

import { ROUTES } from '@renderer/app/router/routes'

import { MediaPlayer } from '../media-player'
import { Modal, QrButton } from '../ui'

export function MediaPlaylist() {
  const [files, setFiles] = useState<TMediaIpcGetFiles>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const errorCountRef = useRef(0)
  const navigate = useNavigate()

  const loadFiles = (): void => {
    window.api.media
      .getFiles()
      .then(setFiles)
      .catch(err => {
        //ошибка маловероятна, но если что показывается экран отсутствия контента
        console.error('Failed to load media files', err)
        setFiles([])
      })
      .finally(() => {
        setIsLoading(false)
      })
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
    console.error('Failed to play media file', currentFile)
    errorCountRef.current += 1
    if (errorCountRef.current >= files.length) {
      console.error('No playable files available')
      window.api.media.requestForceSync() // запрашиваем перезагрузку файлов в main
      navigate(ROUTES.noContent) // потом навигация
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

  const onQrButtonClick = (contentId: number): void => {
    window.api.media.notifyContentClick({ contentId })
    openModal()
  }

  if (isLoading) return null // перед проверкой !files.length чтобы избежать лишнего редиректа
  if (!files.length) return <Navigate to={ROUTES.noContent} replace />
  const currentFile = files[currentIndex]
  const nextFile = files[(currentIndex + 1) % files.length]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MediaPlayer file={currentFile} nextFile={nextFile} onEnded={goNext} onError={handleError} isPaused={isPaused} />
      <QrButton onClick={() => onQrButtonClick(currentFile.contentId)} content={'QR'} />
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
