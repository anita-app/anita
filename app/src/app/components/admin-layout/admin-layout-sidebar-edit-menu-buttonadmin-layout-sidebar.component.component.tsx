import { Icons } from 'app/libs/icons/icons.class'
import React from 'react'
import ReactTooltip from 'react-tooltip'

interface IAdminLayoutSidebarEditMenuButtonProps {
  isEditingMenuItemsVisibility: boolean
  onClick: () => void
}

export const AdminLayoutSidebarEditMenuButton: React.FC<IAdminLayoutSidebarEditMenuButtonProps> = (props) => (
  <>
    <button className="absolute right-3" onClick={props.onClick} data-tip={true} data-for="editMenu">
      {Icons.render(props.isEditingMenuItemsVisibility ? 'checkmarkCircleOutline' : 'cogOutline', 'text-gray-500 text-md')}
    </button>
    <ReactTooltip id="editMenu" effect="solid" place='right'>
      Edit menu
    </ReactTooltip>
  </>
)
