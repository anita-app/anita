import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

export const WORD_PRESS_ROLE_WEIGHT = {
  subscriber: 1,
  contributor: 2,
  author: 3,
  editor: 4,
  administrator: 5,
}

export type TUserRole = keyof typeof WORD_PRESS_ROLE_WEIGHT

/**
 * Who can see a project stored on WordPress: only its owner, or every user with at least the given role.
 */
export type TAccessLevel = 'private' | TUserRole

export const ACCESS_LEVEL_LABELS: Record<TAccessLevel, string> = {
  private: 'Only me',
  administrator: 'Administrators',
  editor: 'Editors and above',
  author: 'Authors and above',
  contributor: 'Contributors and above',
  subscriber: 'All registered users of the site',
}

export const DEFAULT_ACCESS_LEVEL: TAccessLevel = 'private'

/**
 * Name of the plugin in the WordPress plugin directory.
 */
export const WORDPRESS_PLUGIN_NAME = 'Anita Project Manager'
export const WORDPRESS_PLUGIN_URL = 'https://wordpress.org/plugins/anita-project-manager/'

export interface IWordPressAuthData {
  access_token: string
  refresh_token: string
  /** Public URL of the site, without trailing slash. */
  remoteBaseUrl: string
  /** Base URL of the plugin REST API, with trailing slash. Works with any permalink structure. */
  apiUrl: string
}

export interface IWordPressPingResponse {
  plugin: 'anita-project-manager'
  plugin_version: string
  api_version: string
  site_name: string
  remote_id: string
  login_url: string
  api_url: string
  origin_allowed: boolean | null
}

export interface IWordPressSpaceInfo {
  site_name: string
  site_url: string
  remote_id: string
  site_icon_url: string | null
  api_url: string
  login_url: string
  plugin_version: string
  api_version: string
  user_id: number
  user_display_name: string
  user_avatar_url: string
  user_role: TUserRole
  can_create_projects: boolean
  can_create_projects_role: TUserRole
  access_levels: Array<TAccessLevel>
}

export interface IWordPressRemoteInfo {
  remoteId: string
  data: IWordPressSpaceInfo
  /** Set when the tokens are no longer valid and the user must log in again. */
  needsReauth?: boolean
}

/**
 * Metadata of a project stored on WordPress, as returned by get-projects-index.
 */
export interface IWordPressProjectMeta {
  id: string
  title: string
  description: string
  owner_id: number
  access_level: TAccessLevel
  created_at: string | null
  last_modified: string | null
  can_manage: boolean
}

export interface IWordPressProjectResponse {
  project: TAnitaUniversalDataStorage
  meta: IWordPressProjectMeta
}

export interface IWordPressBatchOperation {
  action: 'upsert' | 'delete'
  sectionId: string
  elementId: string
  element?: object
}

export interface IWordPressBatchResult {
  index: number
  ok: boolean
  element_id?: string
  code?: string
  message?: string
}

/**
 * What the app stores locally about a project linked to a WordPress site.
 */
export interface IRemoteProjectInfo {
  projectId: string
  remoteId: string
  ownerId: number
  accessLevel: TAccessLevel
  canManage: boolean
  lastModified: string | null
}
