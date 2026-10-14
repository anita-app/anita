import type { FC } from 'react'

const AVATAR_VARIANTS = ['', 'ui-avatar-1', 'ui-avatar-2']

/** The same project always gets the same color. */
const avatarVariant = (id: string): string => AVATAR_VARIANTS[Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_VARIANTS.length]

interface IProjectAvatarProps {
  id: string
  title?: string
  /** small: menus; regular: sidebar; large: project cards */
  size?: 'small' | 'regular' | 'large'
}

const SIZE_CLASSES = {
  small: 'w-6 h-6 rounded-[7px] text-[0.7rem]',
  regular: 'w-8 h-8 rounded-[9px] text-sm',
  large: 'w-11 h-11 rounded-xl text-lg',
}

/**
 * Gradient tile with the initial of the project.
 */
export const ProjectAvatar: FC<IProjectAvatarProps> = (props) => (
  <span
    className={`ui-avatar ${avatarVariant(props.id)} ${SIZE_CLASSES[props.size ?? 'regular']}`}
    aria-hidden="true"
  >
    {(props.title || '?').trim().charAt(0).toUpperCase()}
  </span>
)
