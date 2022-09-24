import { AnitaStore } from 'app/libs/redux/reducers.const'
import { AdminLayoutSidebarProjectPicker } from 'app/components/admin-layout/admin-layout-sidebar-project-picker.component'
import { useSelector } from 'react-redux'
import React from 'react'
import { Manager } from 'app/libs/manager/manager.class'
import { AdminLayoutSidebarMenuItem } from 'app/components/admin-layout/admin-layout-sidebar-menu-item.component'

interface IAdminLayoutSidebarMenuProps {
  isEditingMenuItemsVisibility: boolean
}

export const AdminLayoutSidebarMenu: React.FC<IAdminLayoutSidebarMenuProps> = (props) => {
  const project = useSelector((state: AnitaStore) => state.project)
  const [currentSelectedSectionId, setCurrentSelectedSectionId] = React.useState<string | null>(null)

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
