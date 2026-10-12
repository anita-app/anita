/**
 * Error codes returned by the Anita Project Manager plugin, plus client-side codes.
 */
export enum WordPressErrorCode {
  unauthorized = 'anita_unauthorized',
  tokenExpired = 'anita_token_expired',
  tokenInvalid = 'anita_token_invalid',
  tokenRevoked = 'anita_token_revoked',
  invalidCode = 'anita_invalid_code',
  forbidden = 'anita_forbidden',
  notFound = 'anita_not_found',
  invalidRequest = 'anita_invalid_request',
  dbError = 'anita_db_error',
  // Client-side
  network = 'client_network',
  notConnected = 'client_not_connected',
  pluginMissing = 'client_plugin_missing',
  originNotAllowed = 'client_origin_not_allowed',
  unknown = 'client_unknown',
}

const AUTH_ERRORS = [
  WordPressErrorCode.unauthorized,
  WordPressErrorCode.tokenInvalid,
  WordPressErrorCode.tokenRevoked,
  WordPressErrorCode.notConnected,
]

export class WordPressApiError extends Error {
  constructor (
    public code: WordPressErrorCode | string,
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'WordPressApiError'
  }

  /**
   * The user must log in again on the site.
   */
  public get requiresLogin (): boolean {
    return AUTH_ERRORS.includes(this.code as WordPressErrorCode)
  }

  /**
   * Temporary problem: the operation can be retried later.
   */
  public get isTemporary (): boolean {
    return this.code === WordPressErrorCode.network || this.code === WordPressErrorCode.dbError || (this.status ?? 0) >= 500
  }

  public static from (error: unknown): WordPressApiError {
    if (error instanceof WordPressApiError) {
      return error
    }
    return new WordPressApiError(WordPressErrorCode.unknown, error instanceof Error ? error.message : String(error))
  }
}

/**
 * Returns a message for the user, in the tone used across the app.
 */
export const getWordPressErrorMessage = (error: unknown, siteName: string): string => {
  const apiError = WordPressApiError.from(error)
  switch (apiError.code) {
    case WordPressErrorCode.network:
      return `Anita could not reach ${siteName}. Your changes are kept on this device and will be synced when the site is reachable again.`
    case WordPressErrorCode.unauthorized:
    case WordPressErrorCode.tokenInvalid:
    case WordPressErrorCode.notConnected:
      return `Your session on ${siteName} has expired. Log in again to resume syncing; your changes are kept on this device.`
    case WordPressErrorCode.tokenRevoked:
      return `This device was disconnected from ${siteName}, for example because your password was changed. Log in again to resume syncing.`
    case WordPressErrorCode.forbidden:
      return `${siteName} did not allow this change: ${apiError.message}`
    case WordPressErrorCode.notFound:
      return `This project is no longer available on ${siteName}.`
    case WordPressErrorCode.dbError:
      return `${siteName} could not save the data. Please try again later.`
    case WordPressErrorCode.pluginMissing:
      return `The ${siteName} site does not have the Anita Project Manager plugin installed or active.`
    case WordPressErrorCode.originNotAllowed:
      return `${siteName} does not accept connections from this address of Anita. An administrator of the site can add it in Settings → Anita → Allowed app URLs.`
    default:
      return apiError.message || `Something went wrong while syncing with ${siteName}.`
  }
}
