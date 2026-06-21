import { useNavigate } from 'react-router'

import { ErrorBoundary } from '@renderer/app/error-boundary'
import { ROUTES } from '@renderer/app/router/routes'
import { Header } from '@renderer/components/layout/header'
import { MediaPlaylist } from '@renderer/components/media-playlist'
import { reportReactBoundaryError } from '@renderer/utils'

function IdleScreen() {
  const navigate = useNavigate()
  return (
    <div
      style={{
        position: 'relative',
        width: '2160px',
        height: '3840px',
        backgroundColor: 'var(--mantine-color-baseColor-9)',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '345px', width: '100%', zIndex: 100 }}>
        <Header />
      </div>
      <div style={{ position: 'absolute', inset: 0 }}>
        <ErrorBoundary
          source="media-playlist"
          autoRecoverMs={15000}
          onError={reportReactBoundaryError}
          onGiveUp={() => navigate(ROUTES.noContent)}
        >
          <MediaPlaylist />
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default IdleScreen
