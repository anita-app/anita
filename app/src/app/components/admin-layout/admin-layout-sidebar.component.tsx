import { memo, useState } from 'react'
import { AdminLayoutSidebarEditMenuButton } from 'app/components/admin-layout/admin-layout-sidebar-edit-menu-button.component'
import { AdminLayoutSidebarMenu } from 'app/components/admin-layout/admin-layout-sidebar-menu.component'
import { useTippyTooltip } from 'app/components/hooks/tippy-tooltip'
import { Icons } from 'app/libs/icons/icons.class'
import { LayoutAtoms } from 'app/state/layout/layout.atoms'
import { appVersion } from 'app/version'
import { useAtomValue } from 'jotai'
import type { FC } from 'react'

export const AdminLayoutSidebar: FC = memo(function Sidebar () {
  const sidebarCollapsed = useAtomValue(LayoutAtoms.sidebarCollapsed)
  const [isEditingMenuItemsVisibility, setIsEditingMenuItemsVisibility] = useState(false)

  const handleEditMenuItemsVisibility = () => {
    setIsEditingMenuItemsVisibility(!isEditingMenuItemsVisibility)
  }

  useTippyTooltip('reportBug', 'Report a bug')

  return (
    <div className="py-5 md:pl-3 lg:pl-4 z-10">
      <div className={`${sidebarCollapsed ? '-translate-x-full' : ''} sidebar ui-sidebar h-full text-prussian-blue-500 w-64 space-y-6 pt-1 pb-8 px-2.5 absolute inset-y-0 left-0 md:relative md:translate-x-0 transform transition duration-200 ease-in-out`}>
        <nav>
          <AdminLayoutSidebarMenu
            isEditingMenuItemsVisibility={isEditingMenuItemsVisibility}
            editMenuButton={(
              <AdminLayoutSidebarEditMenuButton
                isEditingMenuItemsVisibility={isEditingMenuItemsVisibility}
                onClick={handleEditMenuItemsVisibility}
              />
            )}
          />
        </nav>
        <div className="absolute bottom-2 left-4 text-xs text-[#9aa7b8]">
          <div className="flex items-center gap-1.5">
            <p className="inline-block">v{appVersion}</p>·
            <a
              className="flex hover:text-prussian-blue-400 transition-colors"
              href="https://github.com/anita-app/anita/issues"
              target="_blank"
              rel="noreferrer"
              id="reportBug"
            >
              {Icons.render('bugOutline')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
})
