import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { urlParamFiller } from 'app/libs/routing/url-param-fillers.function'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { ProjectPicker } from 'app/components-no/admin-layout/components/project-picker.component'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import React from 'react'
import { Manager } from 'app/libs/manager/manager.class'
import { Icons } from 'app/libs/icons/icons.class'

const baseStyleOfSidebarLinks = 'flex items-center block py-2.5 px-2 transition duration-200 border-l-2 hover:border-prussian-blue-700 hover:text-prussian-blue-500 text-sm font-semibold'

const addActiveClassNameToBaseStyle = (currentPath: string, linkPath: string): string => {
  if (currentPath === linkPath) {
    return `${baseStyleOfSidebarLinks} border-prussian-blue-700`
  }
  return `${baseStyleOfSidebarLinks} border-transparent`
}

export const SidebarMenu = () => {
  const project = useSelector((state: AnitaStore) => state.project)
  const location = useLocation()

  if (project === null) {
    return null
  }

  return (
    <div className="mt-3">
      <ProjectPicker project={project} />
      {Manager.getCurrentProject()?.getSectionsDefinitions().map(section => {
        const linkPath = urlParamFiller(ANITA_URLS.projectSectionElesList, [{ name: URL_PARAMS.projectId, value: project[RESERVED_AUDS_KEYS._settings][0].id }, { name: URL_PARAMS.sectionId, value: section.id }])
        return (
          <Link
            key={section.id}
            to={linkPath}
            className={addActiveClassNameToBaseStyle(location.pathname, linkPath)}
          >
            {Icons.render(Manager.getCurrentProject()?.getSectionById(section.id)?.getSectionIcon() || 'chevronForwardOutline')}<span className="ml-2">{section.title}</span>
          </Link>
        )
      }
      )}

    </div>
  )
}
