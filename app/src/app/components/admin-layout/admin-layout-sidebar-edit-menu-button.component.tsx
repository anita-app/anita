import { useTippyTooltip } from 'app/components/hooks/tippy-tooltip'
import { Icons } from 'app/libs/icons/icons.class'
import type { FC } from 'react'

interface IAdminLayoutSidebarEditMenuButtonProps {
  isEditingMenuItemsVisibility: boolean
  onClick: () => void
}

/**
 * @feature navigation.hide-sections-in-menu
 * @title Show or hide sections in the menu
 * @summary Hide from the sidebar the sections you do not use often, and show them again when needed.
 * @where Sidebar, gear button ("Edit menu") next to the label "Sections".
 * @usage 1. Click the gear button next to "Sections": every section, also the hidden ones, gets an eye icon.
 * 2. Click the eye of a section to hide it (crossed eye, tooltip "Show") or to show it again (open eye, tooltip "Hide").
 * 3. Click the check button that replaced the gear to finish: hidden sections disappear from the menu.
 * @options Each section is shown by default.
 * @rules Hiding a section only removes it from the menu: its records are kept and can still be reached, for example from links of other records.
 * The choice is saved in the project structure, so it is kept after a reload and travels with the project when it is synced or exported.
 * @errors none
 * @status stable
 * @since 0.16.0
 * @related navigation.sidebar
 */
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
