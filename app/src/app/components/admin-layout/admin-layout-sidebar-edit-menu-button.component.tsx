import { useTippyTooltip } from 'app/components/hooks/tippy-tooltip'
import { Icons } from 'app/libs/icons/icons.class'
import type { FC } from 'react'

interface IAdminLayoutSidebarEditMenuButtonProps {
  isEditingMenuItemsVisibility: boolean
  onClick: () => void
}

export const AdminLayoutSidebarEditMenuButton: FC<IAdminLayoutSidebarEditMenuButtonProps> = (props) => {
  useTippyTooltip('editMenu', 'Edit menu')

  return (
    <button
      className="flex w-7 h-7 items-center justify-center rounded-lg text-[#8a97a8] hover:bg-[#eef3f9] hover:text-prussian-blue-500 transition-colors"
      onClick={props.onClick}
      id="editMenu"
    >
      {Icons.render(props.isEditingMenuItemsVisibility ? 'checkmarkCircleOutline' : 'cogOutline', 'text-md')}
    </button>
  )
}
