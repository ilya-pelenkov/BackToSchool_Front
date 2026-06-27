import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { Text } from '@mantine/core'

import { TMediaIpcGetFiles } from '@shared/types'

import { ROUTES } from '@renderer/app/router/routes'
import { logError, useAutoCloseTimer } from '@renderer/utils'

import { MediaPlayer } from '../media-player'
import { Modal, QrButton } from '../ui'
import { QrCloseTimer } from '../ui/qr-close-timer/qr-close-timer'

const QR_BUTTON_TEXT = 'подробнее' // TODO: уточнить текст
const QR_UNAVAILABLE_TEXT = 'QR-код временно недоступен' // TODO: уточнить текст
const QR_MODAL_TITLE = 'Забирай скидку по QR-коду!' // TODO: уточнить текст
const QR_MODAL_TEXT = 'Прямая и мгновенная выгода, понятный призыв к действию.' // TODO: уточнить текст

const QR_MODAL_AUTOCLOSE_MS = 10_000
const QR_MODAL_WARNING_MS = 5_000
const QR_MODAL_EXTEND_MS = QR_MODAL_AUTOCLOSE_MS / 2
const QR_MODAL_MAX_EXTEND_ATEEMPTS = 2

// const MAX_CONSECUTIVE_FILE_ERRORS = 30

export function MediaPlaylist() {
  const [files, setFiles] = useState<TMediaIpcGetFiles>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const failedFileIdsRef = useRef<Set<number>>(new Set())
  const consecutiveErrorsRef = useRef<Map<number, number>>(new Map())
  const navigate = useNavigate()

  const loadFiles = (): void => {
    window.api.media
      .getFiles()
      .then(files => {
        setFiles(files)
        failedFileIdsRef.current = new Set()
        consecutiveErrorsRef.current = new Map()
      })
      .catch(err => {
        logError('Failed to load media files', err)
        setFiles([]) // -> перенаправление на экран пустого контента
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

  const goNext = (contentId: number): void => {
    console.log('next file')
    consecutiveErrorsRef.current.set(contentId, 0) // сбрасываем счётчик ошибок файла, который успешно воспроизвёлся
    setCurrentIndex(i => (i + 1) % files.length)
  }

  const goNextOnError = (): void => {
    setCurrentIndex(i => (i + 1) % files.length)
  }

  const handleError = (): void => {
    const { contentId, type } = currentFile
    logError('Failed to play media file', `id - ${contentId}, type - ${type}`)

    const prevConsecutive = consecutiveErrorsRef.current.get(contentId) ?? 0
    const nextConsecutive = prevConsecutive + 1
    consecutiveErrorsRef.current.set(contentId, nextConsecutive)

    failedFileIdsRef.current.add(contentId)

    if (failedFileIdsRef.current.size >= files.length) {
      logError('No playable files available')
      window.api.media.requestForceSync()
      navigate(ROUTES.noContent)
      return
    }

    //TODO: добавить IPC-канал requestFileSync с логикой
    // if (nextConsecutive >= MAX_CONSECUTIVE_FILE_ERRORS) {
    //   logError('File repeatedly failing, requesting individual sync', `id - ${contentId}`)
    //   window.api.media.requestFileSync(contentId)
    //   consecutiveErrorsRef.current.set(contentId, 0)
    //   failedFileIdsRef.current.delete(contentId)
    // }

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

  const { isWarning, progress, extend } = useAutoCloseTimer({
    isActive: isModalOpen,
    duration: QR_MODAL_AUTOCLOSE_MS,
    warningThreshold: QR_MODAL_WARNING_MS,
    onTimeout: closeModal,
    maxExtendAttempts: QR_MODAL_MAX_EXTEND_ATEEMPTS,
  })

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
      <MediaPlayer
        file={currentFile}
        nextFile={nextFile}
        onEnded={() => goNext(currentFile.contentId)}
        onError={handleError}
        isPaused={isPaused}
      />
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
          <QrCloseTimer progress={progress} isWarning={isWarning} onExtend={() => extend(QR_MODAL_EXTEND_MS)} />
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
