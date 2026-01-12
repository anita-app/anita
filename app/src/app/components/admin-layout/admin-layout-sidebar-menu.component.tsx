import { AdminLayoutSidebarProjectPicker } from 'app/components/admin-layout/admin-layout-sidebar-project-picker.component'
import { AdminLayoutSidebarMenuItem } from 'app/components/admin-layout/admin-layout-sidebar-menu-item.component'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { useState, type FC } from 'react'

interface IAdminLayoutSidebarMenuProps {
  isEditingMenuItemsVisibility: boolean
}

export const AdminLayoutSidebarMenu: FC<IAdminLayoutSidebarMenuProps> = (props) => {
  const projectSystemData = useAtomValue(ProjectAtoms.currentSystemData)
  const project = useAtomValue(ProjectAtoms.currentProject)
  const [currentSelectedSectionId, setCurrentSelectedSectionId] = useState<string | null>(null)

  if (projectSystemData === null || !project) {
    return null
  }

  return (
    <div className="mt-3">
      <AdminLayoutSidebarProjectPicker project={projectSystemData} />
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
  )
}
