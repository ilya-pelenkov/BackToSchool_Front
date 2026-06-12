import { Header } from '@renderer/components/layout/header'
import { MediaPlaylist } from '@renderer/components/media-playlist'

function IdleScreen() {
  return (
    <div style={{ position: 'relative', width: '2160px', height: '3840px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '345px', width: '100%', zIndex: 100 }}>
        <Header />
      </div>
      <div style={{ position: 'absolute', inset: 0 }}>
        <MediaPlaylist />
      </div>
    </div>
  )
}

export default IdleScreen
