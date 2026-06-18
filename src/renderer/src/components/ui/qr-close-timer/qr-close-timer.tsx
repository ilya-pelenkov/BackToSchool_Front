import { useLayoutEffect, useRef, useState } from 'react'

import { Button } from '@mantine/core'

type QrCloseTimerProps = {
  progress: number
  isWarning: boolean
  onExtend: () => void
}

const EXTEND_BUTTON_TEXT = 'Подождите, я сканирую'

export function QrCloseTimer({ progress, isWarning, onExtend }: QrCloseTimerProps) {
  const [active, setActive] = useState(false)
  const bannerContentRef = useRef<HTMLDivElement>(null)
  const [bannerHeight, setBannerHeight] = useState(0)

  // Измеряем реальную высоту баннера каждый раз, когда он становится видимым
  useLayoutEffect(() => {
    if (isWarning && bannerContentRef.current) {
      setBannerHeight(bannerContentRef.current.offsetHeight)
    }
  }, [isWarning])

  return (
    <div style={{ width: '100%', marginTop: '24px' }}>
      <div
        style={{
          width: '90%',
          height: '20px',
          borderRadius: '5px',
          background: 'var(--mantine-color-gray-2)',
          overflow: 'hidden',
          marginTop: '60px',
          marginInline: '60px',
          marginBottom: '60px',
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            borderRadius: '5px',
            background: 'var(--mantine-color-accentColor-4)',
            transition: 'background-color 0.2s ease',
          }}
        />
      </div>

      <div
        style={{
          height: isWarning ? bannerHeight : 0,
          overflow: 'hidden',
          transition: 'height 0.25s ease',
        }}
      >
        <div
          ref={bannerContentRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Button
            onClick={onExtend}
            onPointerDown={() => setActive(true)}
            onPointerUp={() => setActive(false)}
            onPointerLeave={() => setActive(false)}
            styles={{
              root: {
                height: '100px',
                padding: '30px 40px',
                marginBottom: '20px',
                fontSize: '40px',
                color: 'white',
                fontWeight: 600,
                textTransform: 'uppercase',
                transition: 'transform 0.1s ease',
                boxShadow: 'color-mix(in srgb, var(--mantine-color-accentColor-5) 50%, transparent) 0 0 10px 2px',
                ...(active && {
                  backgroundColor: 'var(--mantine-color-accentColor-8)',
                  transform: 'scale(0.95)',
                }),
              },
            }}
          >
            {EXTEND_BUTTON_TEXT}
          </Button>
        </div>
      </div>
    </div>
  )
}
