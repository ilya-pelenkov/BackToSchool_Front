import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { Text } from '@mantine/core'

import { TMediaIpcGetFiles } from '@shared/types'

import { ROUTES } from '@renderer/app/router/routes'

import { MediaPlayer } from '../media-player'
import { Modal, QrButton } from '../ui'

const QR_BUTTON_TEXT = 'подробнее' // TODO: уточнить текст
const QR_UNAVAILABLE_TEXT = 'QR-код временно недоступен' // TODO: уточнить текст
const QR_MODAL_TITLE = 'Забирай скидку по QR-коду!' // TODO: уточнить текст
const QR_MODAL_TEXT = 'Прямая и мгновенная выгода, понятный призыв к действию.' // TODO: уточнить текст

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

  const goNextOnError = (): void => {
    setCurrentIndex(i => (i + 1) % files.length)
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
    goNextOnError()
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
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '475px',
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%)',
          zIndex: 50,
        }}
      ></div>
      <MediaPlayer file={currentFile} nextFile={nextFile} onEnded={goNext} onError={handleError} isPaused={isPaused} />
      {currentFile.qr_code_base64 && (
        <QrButton onClick={() => onQrButtonClick(currentFile.contentId)} content={QR_BUTTON_TEXT} />
      )}
      {isModalOpen && (
        <Modal onClose={closeModal} title={QR_MODAL_TITLE} text={QR_MODAL_TEXT}>
          {currentFile.qr_code_base64 ? (
            <img src={`${currentFile.qr_code_base64}`} alt="QR код" style={{ width: 400, height: 400 }} />
          ) : (
            <Text c="dimmed" style={{ textAlign: 'center' }}>
              {QR_UNAVAILABLE_TEXT}
            </Text>
          )}
        </Modal>
      )}
      {currentFile.qr_code_base64 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '640px',
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%)',
            zIndex: 50,
          }}
        ></div>
      )}
    </div>
  )
}
