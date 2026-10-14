import { AdminLayoutSidebarProjectPicker } from 'app/components/admin-layout/admin-layout-sidebar-project-picker.component'
import { AdminLayoutSidebarMenuItem } from 'app/components/admin-layout/admin-layout-sidebar-menu-item.component'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { useState, type FC, type ReactNode } from 'react'

interface IAdminLayoutSidebarMenuProps {
  isEditingMenuItemsVisibility: boolean
  /** Button to show or hide sections, next to the "Sections" label */
  editMenuButton: ReactNode
}

export const AdminLayoutSidebarMenu: FC<IAdminLayoutSidebarMenuProps> = (props) => {
  const projectSystemData = useAtomValue(ProjectAtoms.currentSystemData)
  const project = useAtomValue(ProjectAtoms.currentProject)
  const [currentSelectedSectionId, setCurrentSelectedSectionId] = useState<string | null>(null)

  if (projectSystemData === null || !project) {
    return null
  }

  return (
    <div className="mt-2">
      <AdminLayoutSidebarProjectPicker
        project={projectSystemData}
        sectionsCount={project.getSectionsDefinitions().length}
      />
      <div className="flex items-center justify-between mt-4 mb-1.5 pl-2.5">
        <p className="ui-nav-label">Sections</p>
        {props.editMenuButton}
      </div>
      <div className="flex flex-col gap-0.5">
        {project.getSectionsDefinitions().map(section => (
          <AdminLayoutSidebarMenuItem
            key={section.id}
            project={projectSystemData}
            section={section}
            selected={currentSelectedSectionId === section.id}
            isEditingMenuItemsVisibility={props.isEditingMenuItemsVisibility}
            setCurrentSelectedSectionId={setCurrentSelectedSectionId}
          />
        ))}
      </div>
    </div>
  )
}
