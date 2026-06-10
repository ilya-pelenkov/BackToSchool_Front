import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { ROUTES } from '@renderer/app/router/routes'

export function NoContentScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = window.api.media.onUpdated(() => {
      window.api.media.getFiles().then(files => {
        if (files.length > 0) {
          navigate(ROUTES.idle)
        }
      })
    })
    return unsubscribe
  }, [navigate])

  return <div>Нет загруженного контента</div>
}
