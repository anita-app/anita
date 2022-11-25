import { ANITA_URLS } from 'app/libs/routing/anita-routes.constant'

const UNIQUE_DATA_SEPARATOR = '|?|?|?|'
export class OAuthUtils {
  public static redirectToAuthPageIfUrlHasCode (): void {
    if (window.location.href.includes('#access_token=')) {
      const hashData = window.location.href.split('#')[1]
      window.location.hash = `${ANITA_URLS.auth}/${UNIQUE_DATA_SEPARATOR}${hashData}`
    }
    if (window.location.href.includes('?code=')) {
      const base = window.location.href.includes('localhost') ? '/' : '/app/'
      const hashData = window.location.href.split('?code=')[1].split('#')[0]
      window.location.href = `${base}#${ANITA_URLS.auth}/${UNIQUE_DATA_SEPARATOR}code=${hashData}`
    }
  }

  public static parseQueryString () {
    const ret = Object.create(null)
    const urlParams = window.location.href.split(UNIQUE_DATA_SEPARATOR)[1]

    urlParams?.split('&').forEach((param) => {
      const parts = param.replace(/\+/g, ' ').split('=')
      let key: string | undefined = parts.shift()
      let val: string | null | undefined = parts.length > 0 ? parts.join('=') : undefined

      key = decodeURIComponent(key as string)

      val = val === undefined ? null : decodeURIComponent(val)

      if (ret[key] === undefined) {
        ret[key] = val
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val)
      } else {
        ret[key] = [ret[key], val]
      }
    })

    return ret
  }
}
