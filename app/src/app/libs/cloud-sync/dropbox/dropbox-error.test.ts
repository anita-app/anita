import { DropboxErrorCode, DropboxSyncError, getDropboxErrorMessage } from 'app/libs/cloud-sync/dropbox/dropbox-error.class'

// Shape of the errors thrown by the Dropbox SDK (DropboxResponseError).
const sdkError = (status: number, error: unknown) => Object.assign(new Error(`Response failed with a ${status} code`), { status, error })

describe('DropboxSyncError.from', () => {
  it('recognizes network failures', () => {
    const error = DropboxSyncError.from(new TypeError('Failed to fetch'))
    expect(error.code).toBe(DropboxErrorCode.network)
    expect(error.isTemporary).toBe(true)
  })

  it('asks to log in again when the token is invalid or the refresh token was revoked', () => {
    expect(DropboxSyncError.from(sdkError(401, { error_summary: 'invalid_access_token/..' })).requiresLogin).toBe(true)
    expect(DropboxSyncError.from(sdkError(400, { error: 'invalid_grant', error_description: 'refresh token is invalid or revoked' })).requiresLogin).toBe(true)
  })

  it('does not ask to log in again for a missing permission', () => {
    const error = DropboxSyncError.from(sdkError(401, { error_summary: 'missing_scope/..' }))
    expect(error.code).toBe(DropboxErrorCode.missingScope)
    expect(error.requiresLogin).toBe(false)
  })

  it('tells apart deleted files, conflicts and full Dropbox accounts', () => {
    expect(DropboxSyncError.from(sdkError(409, { error_summary: 'path/not_found/.' })).code).toBe(DropboxErrorCode.notFound)
    expect(DropboxSyncError.from(sdkError(409, { error_summary: 'path/conflict/file/..' })).code).toBe(DropboxErrorCode.conflict)
    expect(DropboxSyncError.from(sdkError(409, { error_summary: 'path/insufficient_space/..' })).code).toBe(DropboxErrorCode.insufficientSpace)
  })

  it('treats rate limits and server errors as temporary', () => {
    expect(DropboxSyncError.from(sdkError(429, 'too_many_requests')).isTemporary).toBe(true)
    expect(DropboxSyncError.from(sdkError(503, 'unavailable')).isTemporary).toBe(true)
  })

  it('keeps errors that were already converted', () => {
    const error = new DropboxSyncError(DropboxErrorCode.invalidFile, 'not a project')
    expect(DropboxSyncError.from(error)).toBe(error)
  })
})

describe('getDropboxErrorMessage', () => {
  it('reassures that changes are kept on this device when Dropbox cannot be reached', () => {
    expect(getDropboxErrorMessage(new TypeError('Load failed'))).toContain('kept on this device')
  })
})
