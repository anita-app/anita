import { memo } from 'react'
import { Icons } from 'app/libs/icons/icons.class'
import { useTippyTooltip } from 'app/components/hooks/tippy-tooltip'
import type { FC } from 'react'
import type { TIconName } from 'app/libs/icons/icons.class'

interface IAdminLayoutSidebarMenuItemIconProps {
  elementId: string
  tooltip: string
  icon: TIconName
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export const AdminLayoutSidebarMenuItemIcon: FC<IAdminLayoutSidebarMenuItemIconProps> = memo(function AdminLayoutSidebarMenuItem (props: IAdminLayoutSidebarMenuItemIconProps) {
  useTippyTooltip(props.elementId, props.tooltip)

  return (
    <button
      className="flex items-center"
      onClick={props.onClick}
      id={props.elementId}
    >
      {Icons.render(props.icon, 'text-gray-400')}
    </button>
  )
})
