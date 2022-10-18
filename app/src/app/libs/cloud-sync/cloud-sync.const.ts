
export interface IDropboxTokens {
  access_token: string
  account_id: string
  expires_in: number
  refresh_token: string
  scope: string
  token_type: 'bearer'
  uid: string
}

export enum CloudSyncState {
  NOT_CONNECTED = 1,
  OAUTH_IN_PROGRESS,
  NOT_LINKED,
  LINKED
}

export interface ISharedFileMeta {
  type: 'folder' | 'file' | 'deleted'
  name: string
  path: string | undefined
  id: string
}
