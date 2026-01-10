export const WORD_PRESS_ROLE_WEIGHT = {
  subscriber: 1,
  contributor: 2,
  author: 3,
  editor: 4,
  administrator: 5,
}

type TUserRole = 'administrator' | 'editor' | 'author' | 'contributor' | 'subscriber'

interface IWordPressUser {
  last_name: string
  name: string
  picture: string
  role: TUserRole
}

export interface IWordPressSpaceInfo {
  can_create_projects_role: string
  users: Array<IWordPressUser>
  site_name: string
  site_url: string
  user_role: TUserRole
  icon_base_64: string
}

export interface IWordPressRemoteInfo {
  remoteId: string
  data: IWordPressSpaceInfo
}
