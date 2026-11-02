import { memo, useState } from 'react'
import { AdminLayoutSidebarEditMenuButton } from 'app/components/admin-layout/admin-layout-sidebar-edit-menu-button.component'
import { AdminLayoutSidebarMenu } from 'app/components/admin-layout/admin-layout-sidebar-menu.component'
import { useTippyTooltip } from 'app/components/hooks/tippy-tooltip'
import { Icons } from 'app/libs/icons/icons.class'
import { LayoutAtoms } from 'app/state/layout/layout.atoms'
import { appVersion } from 'app/version'
import { useAtomValue } from 'jotai'
import type { FC } from 'react'

/**
 * @feature navigation.sidebar
 * @title Sidebar and sections menu
 * @summary The menu on the left that lists the sections of the open project and takes you to their records.
 * @where Left side of every page while a project is open; on phones it is hidden behind the menu button (three lines) at the top left of the header.
 * @usage 1. Open a project.
 * 2. Click a section under "Sections" to see its records.
 * 3. On a phone, tap the menu button in the header to open the sidebar; tap a section, or anywhere outside the sidebar, to close it.
 * @options none
 * @rules The sidebar appears only when a project is open; on the projects list with no project it is not shown.
 * At the top is the project picker, then the label "Sections" with the list of the sections in the order of the project.
 * Each section shows its icon (a chevron when it has none) and its short name when one is set, otherwise its full name; long names are cut.
 * The section you are viewing is highlighted.
 * Sections hidden from the menu are not listed (see "Show or hide sections in the menu").
 * On wide screens the sidebar is always visible; on small screens it slides in over the page and closes after you pick a section.
 * At the bottom it shows the version of Anita ("v" and the number) and a bug icon ("Report a bug") that opens the Anita issues page on GitHub in a new tab.
 * @errors none
 * @status stable
 * @since 0.1.0
 * @routes projectDetails, projectSectionElesList, projectSectionEleDetails, projectSectionAddEle, projectSectionEditEle
 * @related navigation.project-picker, navigation.hide-sections-in-menu
 */
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
