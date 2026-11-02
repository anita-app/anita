import type { TAnitaUniversalDataStorage } from 'app/models/project/project.declarations'

/** @featurePart sync.wordpress-share */
export const WORD_PRESS_ROLE_WEIGHT = {
  subscriber: 1,
  contributor: 2,
  author: 3,
  editor: 4,
  administrator: 5,
}

/** @internal */
export type TUserRole = keyof typeof WORD_PRESS_ROLE_WEIGHT

/**
 * Who can see a project stored on WordPress: only its owner, or every user with at least the given role.
 *
 * @feature sync.wordpress-share
 * @title Share a project with the users of a WordPress site
 * @summary Chooses who can see a project stored on a WordPress site, from only you to every registered user, by WordPress role.
 * @where "Who can see it on the site" when choosing a WordPress site as storage of a new or local project; the access level next to "Remote storage" in the project settings; "Visible to" on the project page.
 * @usage 1. Choose a WordPress site as storage of the project. 2. Pick who can see it. 3. The users of the site with that role see the project in Anita after connecting the same site.
 * @options "Only me" (default), "Administrators", "Editors and above", "Authors and above", "Contributors and above", "All registered users of the site".
 * @rules The project page says "you own this project" to its owner, and "shared with you: only its owner or an administrator can change its structure" to the others: they can add and edit records but not edit the project. Only the owner or an administrator can delete a project from the site ("Only the owner of the project or an administrator of the site can delete it."); deleting removes it from the site and from this device, for every user it is shared with. Sites list only users whose role is allowed to create projects as possible storage ("Cannot create projects on this site"). When the site refuses a change: "<site> did not allow this change: <reason>".
 * @errors wordpress.forbidden
 * @status beta
 * @since 1.0.0
 * @related sync.wordpress-projects, sync.wordpress-removed-projects
 */
export type TAccessLevel = 'private' | TUserRole

/** @featurePart sync.wordpress-share */
export const ACCESS_LEVEL_LABELS: Record<TAccessLevel, string> = {
  private: 'Only me',
  administrator: 'Administrators',
  editor: 'Editors and above',
  author: 'Authors and above',
  contributor: 'Contributors and above',
  subscriber: 'All registered users of the site',
}

/** @featurePart sync.wordpress-share */
export const DEFAULT_ACCESS_LEVEL: TAccessLevel = 'private'

/**
 * Name of the plugin in the WordPress plugin directory.
 * @featurePart sync.wordpress-connect
 */
export const WORDPRESS_PLUGIN_NAME = 'Anita Project Manager'
/** @featurePart sync.wordpress-connect */
export const WORDPRESS_PLUGIN_URL = 'https://wordpress.org/plugins/anita-project-manager/'

/** @internal */
export interface IWordPressAuthData {
  access_token: string
  refresh_token: string
  /** Public URL of the site, without trailing slash. */
  remoteBaseUrl: string
  /** Base URL of the plugin REST API, with trailing slash. Works with any permalink structure. */
  apiUrl: string
}

/** @internal */
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

/** @internal */
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

/** @internal */
export interface IWordPressRemoteInfo {
  remoteId: string
  data: IWordPressSpaceInfo
  /** Set when the tokens are no longer valid and the user must log in again. */
  needsReauth?: boolean
}

/**
 * Metadata of a project stored on WordPress, as returned by get-projects-index.
 * @internal
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

/** @internal */
export interface IWordPressProjectResponse {
  project: TAnitaUniversalDataStorage
  meta: IWordPressProjectMeta
}

/** @internal */
export interface IWordPressBatchOperation {
  action: 'upsert' | 'delete'
  sectionId: string
  elementId: string
  element?: object
}

/** @internal */
export interface IWordPressBatchResult {
  index: number
  ok: boolean
  element_id?: string
  code?: string
  message?: string
}

/**
 * What the app stores locally about a project linked to a WordPress site.
 * @internal
 */
export interface IRemoteProjectInfo {
  projectId: string
  remoteId: string
  ownerId: number
  accessLevel: TAccessLevel
  canManage: boolean
  lastModified: string | null
}
