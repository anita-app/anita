import { WordPressClient } from 'app/libs/cloud-sync/wordpress/wordpress-client.class'
import { WordpressHelper } from 'app/libs/cloud-sync/wordpress/wordpress-helper.class'
import { WordPressApiError, WordPressErrorCode } from 'app/libs/cloud-sync/wordpress/wordpress-api-error.class'
import type { IWordPressPingResponse } from 'app/libs/cloud-sync/wordpress/wordpress.const'

const PENDING_AUTH_KEY = 'anita.wordpress.pendingAuth'
const PENDING_AUTH_MAX_AGE_MS = 30 * 60 * 1000

interface IPendingAuth {
  state: string
  codeVerifier: string
  /** Site the user chose, checked before leaving the app: the answer must come from the same site. */
  remoteId: string
  apiUrl: string
  createdAt: number
  /** Project to link to the site once connected. */
  linkProjectId?: string
}

interface ILoginPayload {
  auth_code: string
  remoteBaseUrl: string
  remoteId: string
  apiUrl: string
  state: string
}

export interface ICompletedLogin {
  remoteId: string
  siteName: string
  userName: string
  linkProjectId?: string
  /** Set when this device was connected to the site with another account. */
  previousUserName?: string
  /** Stores the connection on this device. */
  commit: () => Promise<void>
}

const base64UrlEncode = (bytes: Uint8Array): string => {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const randomString = (bytes = 32): string => base64UrlEncode(crypto.getRandomValues(new Uint8Array(bytes)))

const hostOf = (remoteIdOrUrl: string): string => remoteIdOrUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase()

const sha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return base64UrlEncode(new Uint8Array(digest))
}

/**
 * Connection of the app to a WordPress site.
 *
 * The user is sent to the login page of the site (the standard WordPress login, then an approval page).
 * The site sends the browser back to this app with a single-use code, exchanged for tokens with PKCE.
 */
export class WordPressAuth {
  /**
   * Turns what the user typed into a site URL: adds https:// when missing and drops admin paths.
   */
  public static normalizeSiteUrl (input: string): string {
    let url = input.trim()
    if (!/^https?:\/\//i.test(url)) {
      // Local development sites usually have no certificate.
      url = /^(localhost|127\.0\.0\.1|[^/]+\.(test|localhost))([:/]|$)/i.test(url) ? `http://${url}` : `https://${url}`
    }
    url = url.replace(/[?#].*$/, '').replace(/\/(wp-admin|wp-login\.php|wp-json)(\/.*)?$/i, '').replace(/\/+$/, '')
    return url
  }

  /**
   * Checks that the site has the plugin and accepts this app.
   */
  public static async checkSite (siteUrl: string): Promise<IWordPressPingResponse> {
    const normalizedUrl = WordPressAuth.normalizeSiteUrl(siteUrl)
    const ping = await WordPressClient.ping(normalizedUrl)
    // A site cannot claim to be another one.
    if (hostOf(ping.remote_id) !== hostOf(normalizedUrl) || hostOf(ping.api_url) !== hostOf(normalizedUrl)) {
      throw new WordPressApiError(WordPressErrorCode.invalidCode, `The site answered with the address ${ping.remote_id}. Connect using that address.`)
    }
    if (ping.origin_allowed === false) {
      throw new WordPressApiError(WordPressErrorCode.originNotAllowed, 'This app is not allowed by the site.')
    }
    return ping
  }

  /**
   * The URL the site sends the user back to: this app.
   */
  public static getReturnUrl (): string {
    return `${window.location.origin}${window.location.pathname}`
  }

  /**
   * Opens the login page of the site in this tab.
   */
  public static async startLogin (site: Pick<IWordPressPingResponse, 'login_url' | 'api_url' | 'remote_id'>, options: { linkProjectId?: string } = {}): Promise<void> {
    const pending: IPendingAuth = {
      state: randomString(16),
      codeVerifier: randomString(32),
      remoteId: WordpressHelper.normalizeRemoteId(site.remote_id),
      apiUrl: site.api_url,
      createdAt: Date.now(),
      linkProjectId: options.linkProjectId,
    }
    localStorage.setItem(PENDING_AUTH_KEY, JSON.stringify(pending))

    const loginUrl = new URL(site.login_url)
    loginUrl.searchParams.set('return_to', WordPressAuth.getReturnUrl())
    loginUrl.searchParams.set('state', pending.state)
    loginUrl.searchParams.set('code_challenge', await sha256(pending.codeVerifier))
    window.location.assign(loginUrl.toString())
  }

  /**
   * Opens the login page of a connected site, to renew the session.
   */
  public static async reconnect (remoteId: string): Promise<void> {
    const remote = await WordpressHelper.instance.getRemoteInfo(remoteId)
    const site = remote?.data.login_url && remote?.data.api_url
      ? { login_url: remote.data.login_url, api_url: remote.data.api_url, remote_id: remoteId }
      : await WordPressAuth.checkSite(remote?.data.site_url ?? remoteId)
    await WordPressAuth.startLogin(site)
  }

  /**
   * Completes the login with the code received from the site. The connection is stored by calling `commit`.
   */
  public static async completeLogin (encodedPayload: string): Promise<ICompletedLogin> {
    let payload: ILoginPayload
    try {
      payload = JSON.parse(atob(encodedPayload))
    } catch {
      throw new WordPressApiError(WordPressErrorCode.invalidCode, 'The answer of the site could not be read. Please connect again.')
    }

    const pending = WordPressAuth.readPendingAuth()
    if (!pending || pending.state !== payload.state) {
      throw new WordPressApiError(WordPressErrorCode.invalidCode, 'This connection was not started from this browser, or it took too long. Please connect again from Anita.')
    }
    localStorage.removeItem(PENDING_AUTH_KEY)

    const remoteIdFromPayload = WordpressHelper.normalizeRemoteId(payload.remoteId || payload.remoteBaseUrl || '')
    if (remoteIdFromPayload !== pending.remoteId) {
      throw new WordPressApiError(WordPressErrorCode.invalidCode, `The answer came from ${remoteIdFromPayload} instead of ${pending.remoteId}. Please connect again.`)
    }
    // The API address checked before leaving the app is the one used.
    const apiUrl = pending.apiUrl
    const tokens = await WordPressClient.exchangeCode(apiUrl, payload.auth_code, pending.codeVerifier)
    const authData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      remoteBaseUrl: payload.remoteBaseUrl.replace(/\/+$/, ''),
      apiUrl,
    }
    const remoteId = pending.remoteId
    const spaceInfo = await new WordPressClient(remoteId, authData).getSpaceInfo()
    const previous = await WordpressHelper.instance.getRemoteInfo(remoteId)

    return {
      remoteId,
      siteName: spaceInfo.site_name,
      userName: spaceInfo.user_display_name,
      linkProjectId: pending.linkProjectId,
      previousUserName: previous && previous.data.user_id !== spaceInfo.user_id ? previous.data.user_display_name : undefined,
      commit: () => WordpressHelper.instance.saveConnection(remoteId, authData, spaceInfo),
    }
  }

  public static clearPendingLogin (): void {
    localStorage.removeItem(PENDING_AUTH_KEY)
  }

  private static readPendingAuth (): IPendingAuth | null {
    try {
      const pending = JSON.parse(localStorage.getItem(PENDING_AUTH_KEY) ?? 'null') as IPendingAuth | null
      if (!pending || Date.now() - pending.createdAt > PENDING_AUTH_MAX_AGE_MS) {
        return null
      }
      return pending
    } catch {
      return null
    }
  }
}
