export enum DropboxErrorCode {
  network = 'network',
  notConnected = 'not_connected',
  /** The tokens are no longer valid: the user must log in again. */
  authFailed = 'auth_failed',
  /** The connection lacks a permission (old connections). */
  missingScope = 'missing_scope',
  notFound = 'not_found',
  /** The file was changed elsewhere since it was read. */
  conflict = 'conflict',
  insufficientSpace = 'insufficient_space',
  rateLimited = 'rate_limited',
  serverError = 'server_error',
  /** The file is not an Anita project. */
  invalidFile = 'invalid_file',
  unknown = 'unknown',
}

interface IDropboxSdkError {
  status?: number
  error?: unknown
  message?: string
  name?: string
}

const summaryOf = (error: unknown): string => {
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object') {
    const { error_summary: summary, error: inner, error_description: description } = error as Record<string, unknown>
    if (typeof summary === 'string') {
      return summary
    }
    if (typeof inner === 'string') {
      return typeof description === 'string' ? `${inner}: ${description}` : inner
    }
  }
  return ''
}

export class DropboxSyncError extends Error {
  constructor (
    public code: DropboxErrorCode,
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'DropboxSyncError'
  }

  public get requiresLogin (): boolean {
    return this.code === DropboxErrorCode.authFailed || this.code === DropboxErrorCode.notConnected
  }

  /**
   * Temporary problem: the operation can be retried later.
   */
  public get isTemporary (): boolean {
    return [DropboxErrorCode.network, DropboxErrorCode.rateLimited, DropboxErrorCode.serverError].includes(this.code)
  }

  /**
   * Converts errors of the Dropbox SDK (and of fetch) into a DropboxSyncError.
   */
  public static from (error: unknown): DropboxSyncError {
    if (error instanceof DropboxSyncError) {
      return error
    }
    const sdkError = (error ?? {}) as IDropboxSdkError
    const status = typeof sdkError.status === 'number' ? sdkError.status : undefined
    const summary = summaryOf(sdkError.error)

    if (status === undefined) {
      // fetch rejects with a TypeError when the server cannot be reached ("Failed to fetch", "Load failed"…).
      if (error instanceof TypeError || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
        return new DropboxSyncError(DropboxErrorCode.network, 'Dropbox cannot be reached.')
      }
      return new DropboxSyncError(DropboxErrorCode.unknown, sdkError.message || String(error))
    }
    if (status === 401) {
      if (summary.includes('missing_scope')) {
        return new DropboxSyncError(DropboxErrorCode.missingScope, summary, status)
      }
      return new DropboxSyncError(DropboxErrorCode.authFailed, summary || 'The Dropbox session is no longer valid.', status)
    }
    // A refresh token that was revoked, or a login code that was already used.
    if (status === 400 && /invalid_grant/.test(summary)) {
      return new DropboxSyncError(DropboxErrorCode.authFailed, summary, status)
    }
    if (status === 409) {
      if (summary.includes('not_found')) {
        return new DropboxSyncError(DropboxErrorCode.notFound, summary, status)
      }
      if (summary.includes('insufficient_space')) {
        return new DropboxSyncError(DropboxErrorCode.insufficientSpace, summary, status)
      }
      if (summary.includes('conflict')) {
        return new DropboxSyncError(DropboxErrorCode.conflict, summary, status)
      }
    }
    if (status === 429) {
      return new DropboxSyncError(DropboxErrorCode.rateLimited, summary || 'Too many requests.', status)
    }
    if (status >= 500) {
      return new DropboxSyncError(DropboxErrorCode.serverError, summary || 'Dropbox is not available.', status)
    }
    return new DropboxSyncError(DropboxErrorCode.unknown, summary || `Dropbox answered with an error (${status}).`, status)
  }
}

/**
 * Returns a message for the user, in the tone used across the app.
 */
export const getDropboxErrorMessage = (error: unknown): string => {
  const syncError = DropboxSyncError.from(error)
  switch (syncError.code) {
    case DropboxErrorCode.network:
      return 'Anita could not reach Dropbox. Your changes are kept on this device and will be synced when Dropbox is reachable again.'
    case DropboxErrorCode.notConnected:
      return 'Dropbox is not connected on this device. Connect it to sync this project; until then, changes are saved on this device only.'
    case DropboxErrorCode.authFailed:
    case DropboxErrorCode.missingScope:
      return 'Your Dropbox session has expired or was disconnected. Log in again to resume syncing; your changes are kept on this device.'
    case DropboxErrorCode.notFound:
      return 'The file of this project is no longer in your Dropbox.'
    case DropboxErrorCode.conflict:
      return 'The file of this project was changed on another device while syncing. Please try again.'
    case DropboxErrorCode.insufficientSpace:
      return 'Your Dropbox is full. Free some space to resume syncing; your changes are kept on this device.'
    case DropboxErrorCode.rateLimited:
    case DropboxErrorCode.serverError:
      return 'Dropbox is busy right now. Your changes are kept on this device and will be synced shortly.'
    case DropboxErrorCode.invalidFile:
      return 'The file in your Dropbox is not a valid Anita project.'
    default:
      return syncError.message ? `Something went wrong while syncing with Dropbox: ${syncError.message}` : 'Something went wrong while syncing with Dropbox.'
  }
}
