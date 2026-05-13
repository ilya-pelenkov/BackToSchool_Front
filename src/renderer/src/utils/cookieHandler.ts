interface CookieOptions {
  expires?: Date | string
  maxAge?: number
  domain?: string
  path?: string
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

export const cookieHandler = {
  get: (name: string) => {
    const cookie = document.cookie.split('; ').find(str => str.startsWith(`${name}=`))
    if (!cookie) return null
    try {
      const cookieValue = cookie.split('=')[1]
      return JSON.parse(decodeURIComponent(cookieValue))
    } catch {
      return null
    }
  },
  set: ({ name, value, options }: { name: string; value: object; options?: CookieOptions }) => {
    const encodedData = encodeURIComponent(JSON.stringify(value))
    const encodedName = encodeURIComponent(name)
    let newCookie = `${encodedName}=${encodedData}`

    if (options?.expires) {
      newCookie += `; expires=${options.expires instanceof Date ? options.expires.toUTCString() : options.expires}`
    }

    if (options?.maxAge) {
      const expiresDate = new Date()
      expiresDate.setTime(expiresDate.getTime() + options.maxAge * 1000)
      newCookie += `; expires=${expiresDate.toUTCString()}`
    }

    if (options?.domain) {
      newCookie += `; domain=${options.domain}`
    }

    if (options?.path) {
      newCookie += `; path=${options.path}`
    }

    if (options?.secure) {
      newCookie += '; secure'
    }

    if (options?.sameSite) {
      newCookie += `; SameSite=${options.sameSite}`
    }

    document.cookie = newCookie
  },
  delete(name: string, domain?: string, path?: string): void {
    let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`

    if (domain) {
      cookieString += `; domain=${domain}`
    }

    if (path) {
      cookieString += `; path=${path}`
    }

    document.cookie = cookieString
  },
}
