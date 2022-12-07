import React, { memo, useEffect, useState } from 'react'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { RESERVED_AUDS_KEYS, TSystemData } from 'app/models/project/project.declarations'
import { Link } from 'react-router-dom'
import { Manager } from 'app/libs/manager/manager.class'
import { Icons } from 'app/libs/icons/icons.class'
import { ISection } from 'app/models/section/section.declarations'
import { storeDispatcher } from 'app/libs/redux/store-dispatcher.function'
import { REDUX_ACTIONS } from 'app/libs/redux/redux-actions.const'
import { AdminLayoutSidebarMenuItemIcon } from 'app/components/admin-layout/admin-layout-sidebar-menu-item-icon.component'

const baseStyleOfSidebarLinks = 'flex items-center block py-2.5 px-2 transition duration-200 border-l-2 hover:border-prussian-blue-700 hover:text-prussian-blue-500 text-sm font-semibold'

const addActiveClassNameToBaseStyle = (selected: boolean): string => {
  if (selected) {
    return `${baseStyleOfSidebarLinks} border-prussian-blue-700`
  }
  return `${baseStyleOfSidebarLinks} border-transparent`
}

interface IAdminLayoutSidebarMenuItemProps {
  project: TSystemData
  section: ISection
  selected?: boolean
  isEditingMenuItemsVisibility: boolean
  setCurrentSelectedSectionId: (id: string) => void
}

export const AdminLayoutSidebarMenuItem: React.FC<IAdminLayoutSidebarMenuItemProps> = memo(function AdminLayoutSidebarMenuItem (props: IAdminLayoutSidebarMenuItemProps) {
  const linkPath = urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: props.project[RESERVED_AUDS_KEYS._settings][0].id }, { name: URL_PARAMS.sectionId, value: props.section.id }])
  const [isHiddenInMenu, setIsHiddenInMenu] = useState<boolean>(Manager.getCurrentProject()?.getSectionById(props.section.id)?.getIsHiddenInMenu()!)

  const sectionId = props.section.id
  const setCurrentSelectedSectionId = props.setCurrentSelectedSectionId
  const selected = props.selected

  useEffect(() => {
    if (window.location.hash.includes(sectionId) && !selected) {
      setCurrentSelectedSectionId(sectionId)
    }
  }, [setCurrentSelectedSectionId, sectionId, selected])

  const handleVisibilityClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const newValue = !Manager.getCurrentProject()?.getSectionById(props.section.id)?.getIsHiddenInMenu()
    e.preventDefault()
    e.stopPropagation()
    setIsHiddenInMenu(newValue)
    Manager.getCurrentProject()?.getSectionById(props.section.id)?.setIsHiddenInMenu(newValue)
  }

  if (isHiddenInMenu && !props.isEditingMenuItemsVisibility) {
    return null
  }

  const icon = isHiddenInMenu ? 'eyeOffOutline' : 'eyeOutline'
  const tooltip = isHiddenInMenu ? 'Show' : 'Hide'

  const handleLinkClick = () => {
    props.setCurrentSelectedSectionId(props.section.id)
    storeDispatcher({ type: REDUX_ACTIONS.toggleSidebar })
  }

  return (
    <Link
      key={props.section.id}
      to={linkPath}
      onClick={handleLinkClick}
      className={addActiveClassNameToBaseStyle(!!props.selected)}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          {Icons.render(Manager.getCurrentProject()?.getSectionById(props.section.id)?.getSectionIcon() || 'chevronForwardOutline')}<span className="ml-2">{props.section.title_short || props.section.title}</span>
        </div>
        {props.isEditingMenuItemsVisibility && (
          <AdminLayoutSidebarMenuItemIcon elementId={`menuItem${props.section.id}`} tooltip={tooltip} icon={icon} onClick={handleVisibilityClick} />
        )}
      </div>
    </Link>
  )
}, (prevProps, nextProps) => (
  prevProps.selected === nextProps.selected &&
  prevProps.isEditingMenuItemsVisibility === nextProps.isEditingMenuItemsVisibility &&
  prevProps.project === nextProps.project &&
  prevProps.section === nextProps.section
))
