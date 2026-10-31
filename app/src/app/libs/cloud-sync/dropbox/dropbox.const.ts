/**
 * Value of the `remoteStorage` setting of a project synced with Dropbox.
 * WordPress sites use their address there, which always contains a dot, so the two never collide.
 * @internal
 */
export const DROPBOX_REMOTE_ID = 'dropbox'

/**
 * Folder of the user's Dropbox where projects are saved. Projects found there are downloaded on every device
 * connected to the same Dropbox account.
 * @featurePart sync.dropbox-projects
 */
export const DROPBOX_PROJECTS_FOLDER = '/Anita'

/** @internal */
export const DROPBOX_CLIENT_ID = 'neonkm3wexybl7c'

/** @featurePart security.sync-sessions */
export const DROPBOX_SCOPES = [
  // Granted to every Dropbox app: used to show which account is connected.
  'account_info.read',
  'files.content.write',
  'files.content.read',
  'file_requests.write',
  'file_requests.read',
]

/**
 * Tokens returned by Dropbox when the user logs in.
 * @internal
 */
export interface IDropboxTokens {
  access_token: string
  account_id: string
  expires_in: number
  refresh_token: string
  scope: string
  token_type: 'bearer'
  uid: string
}

/**
 * What the app stores about the connected Dropbox account (one per device).
 * @internal
 */
export interface IDropboxAccountData extends IDropboxTokens {
  /** Time when the access token expires, in milliseconds. */
  expires_at?: number
  account_name?: string
  email?: string
  /** Set when the tokens are no longer valid and the user must log in again. */
  needsReauth?: boolean
}

/**
 * The connected Dropbox account, as shown in the UI (without tokens).
 * @internal
 */
export interface IDropboxAccountState {
  accountId: string
  accountName?: string
  email?: string
  needsReauth: boolean
}

/**
 * The Dropbox file a project is synced with, on this device.
 * @internal
 */
export interface IDropboxFileLink {
  projectId: string
  fileId: string
  /** Path of the file when it was last synced, for display. */
  path?: string
  name?: string
  /** Revision of the file at the last sync: a different one means the file was changed elsewhere. */
  rev?: string
}

/**
 * An Anita project file found in the Dropbox projects folder.
 * @internal
 */
export interface IDropboxProjectFile {
  fileId: string
  path: string
  name: string
  rev: string
  /** Id of the project in the file, or null if the file is not an Anita project. */
  projectId: string | null
}
