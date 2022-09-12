import React, { useState } from 'react'
import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { RESERVED_AUDS_KEYS, TSystemData } from 'app/models/project/project.declarations'
import { Link } from 'react-router-dom'
import { Manager } from 'app/libs/manager/manager.class'
import { Icons } from 'app/libs/icons/icons.class'
import { ISection } from 'app/models/section/section.declarations'
import ReactTooltip from 'react-tooltip'

const baseStyleOfSidebarLinks = 'flex items-center block py-2.5 px-2 transition duration-200 border-l-2 hover:border-prussian-blue-700 hover:text-prussian-blue-500 text-sm font-semibold'

const addActiveClassNameToBaseStyle = (currentPath: string, linkPath: string): string => {
  if (currentPath === linkPath) {
    return `${baseStyleOfSidebarLinks} border-prussian-blue-700`
  }
  return `${baseStyleOfSidebarLinks} border-transparent`
}

interface IAdminLayoutSidebarMenuItemProps {
  project: TSystemData
  section: ISection
  isEditingMenuItemsVisibility: boolean
}

export const AdminLayoutSidebarMenuItem: React.FC<IAdminLayoutSidebarMenuItemProps> = (props) => {
  const linkPath = urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: props.project[RESERVED_AUDS_KEYS._settings][0].id }, { name: URL_PARAMS.sectionId, value: props.section.id }])
  const [isHiddenInMenu, setIsHiddenInMenu] = useState<boolean>(Manager.getCurrentProject()?.getSectionById(props.section.id)?.getIsHiddenInMenu()!)

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

  return (
    <Link
      key={props.section.id}
      to={linkPath}
      className={addActiveClassNameToBaseStyle(location.pathname, linkPath)}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          {Icons.render(Manager.getCurrentProject()?.getSectionById(props.section.id)?.getSectionIcon() || 'chevronForwardOutline')}<span className="ml-2">{props.section.title}</span>
        </div>
        {props.isEditingMenuItemsVisibility && (
          <>
            <button className="flex items-center" onClick={handleVisibilityClick} data-tip={true} data-for={`menuItem${props.section.id}`}>
              {Icons.render(icon, 'text-gray-400')}
            </button>
            <ReactTooltip id={`menuItem${props.section.id}`} effect="solid" place='right'>
              {tooltip}
            </ReactTooltip>
          </>
        )}
      </div>
    </Link>
  )
}
