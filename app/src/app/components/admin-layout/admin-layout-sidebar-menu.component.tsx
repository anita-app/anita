import { AdminLayoutSidebarProjectPicker } from 'app/components/admin-layout/admin-layout-sidebar-project-picker.component'
import { Manager } from 'app/cross-refs-exports'
import { AdminLayoutSidebarMenuItem } from 'app/components/admin-layout/admin-layout-sidebar-menu-item.component'
import { useAtomValue } from 'jotai'
import { ProjectAtoms } from 'app/state/project/project.atoms'
import { useState, type FC } from 'react'

interface IAdminLayoutSidebarMenuProps {
  isEditingMenuItemsVisibility: boolean
}

export const AdminLayoutSidebarMenu: FC<IAdminLayoutSidebarMenuProps> = (props) => {
  const project = useAtomValue(ProjectAtoms.currentSystemData)
  const [currentSelectedSectionId, setCurrentSelectedSectionId] = useState<string | null>(null)

  if (project === null) {
    return null
  }

  return (
    <div className="mt-3">
      <AdminLayoutSidebarProjectPicker project={project} />
      {Manager.getCurrentProject()?.getSectionsDefinitions().map(section => (
        <AdminLayoutSidebarMenuItem
          key={section.id}
          project={project}
          section={section}
          selected={currentSelectedSectionId === section.id}
          isEditingMenuItemsVisibility={props.isEditingMenuItemsVisibility}
          setCurrentSelectedSectionId={setCurrentSelectedSectionId}
        />
      ))}

    </div>
  )
}
