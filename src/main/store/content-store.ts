import Store from 'electron-store'

import { CachedContent } from '@shared/types'

export interface ContentSchema {
  lastSync: string
  items: Record<number, CachedContent>
}

export const contentStore = new Store<ContentSchema>({
  name: 'content',
  defaults: {
    lastSync: '',
    items: {},
  },
})
