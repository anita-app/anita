import { useTippyTooltip } from 'app/components/hooks/use-tippy-tooltip'
import { Icons } from 'app/libs/icons/icons.class'
import React from 'react'

interface IAdminLayoutSidebarEditMenuButtonProps {
  isEditingMenuItemsVisibility: boolean
  onClick: () => void
}

export const AdminLayoutSidebarEditMenuButton: React.FC<IAdminLayoutSidebarEditMenuButtonProps> = (props) => {
  useTippyTooltip('editMenu', 'Edit menu')

  return (
    <button className="absolute right-3" onClick={props.onClick} id="editMenu">
      {Icons.render(props.isEditingMenuItemsVisibility ? 'checkmarkCircleOutline' : 'cogOutline', 'text-gray-500 text-md')}
    </button>
  )
}
