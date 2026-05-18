import { useEffect, useRef, useState } from 'react'

import { TMediaIpcGetFiles } from '@shared/types'

import QrExample from '../../assets/QR_code_for_mobile_English_Wikipedia.svg'
import { MediaPlayer } from '../media-player'
import { Modal, QrButton } from '../ui'

const IMAGE_DURATION = 5000 //TODO: получать из расписания отдельным запросом к main
//TODO: получать qr для каждого медиа отдельным запросом к main

export function MediaPlaylist() {
  const [files, setFiles] = useState<TMediaIpcGetFiles>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const errorCountRef = useRef(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const openModal = (): void => {
    setIsPaused(true)
    setIsModalOpen(true)
  }

  const closeModal = (): void => {
    setIsPaused(false)
    setIsModalOpen(false)
  }

  if (!files.length) return <p>Нет файлов в папке cached</p> //TODO: продумать заглушку

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MediaPlayer
        file={{ ...files[currentIndex], duration: IMAGE_DURATION }}
        nextFile={{ ...files[(currentIndex + 1) % files.length], duration: IMAGE_DURATION }}
        onEnded={goNext}
        onError={handleError}
        isPaused={isPaused}
      />
      <QrButton onClick={openModal} content={'QR'} />
      {isModalOpen && (
        <Modal onClose={closeModal}>
          {QrExample ? (
            <img src={QrExample} alt="QR код" style={{ width: 240, height: 240 }} />
          ) : (
            <p>QR код недоступен</p>
          )}
        </Modal>
      )}
    </div>
  )
}
