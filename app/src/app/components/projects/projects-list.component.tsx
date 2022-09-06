import { ANITA_URLS } from 'app/libs/routing-n/anita-routes.constant'
import { ProjectsListLoader } from 'app/libs/projects-helpers/projects-handlers/projects-list-loader.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { ProjectCard } from 'app/components/projects/project-card.component'
import { ImportProjectButton } from 'app/components/projects/project-importer-components/import-project-button.component'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'

export const ProjectsList: React.FC = () => {
  const [hasLoaded, setHasLoaded] = useState(false)
  const projects = useSelector((state: AnitaStore) => state.projects)
  const projectsLenght = projects?.length || 0

  useEffect(() => {
    let isMounted = true
    const loadProjectsList = async () => {
      await new ProjectsListLoader().load()
      setHasLoaded(true)
    }
    if (isMounted) {
      loadProjectsList()
    }

    return () => {
      isMounted = false
    }
  }, [projectsLenght])

  if (Array.isArray(projects) && projects.length === 0) {
    return <Navigate to={ANITA_URLS.projectsNone} />
  }

  if (!hasLoaded) {
    return null
  }

  return (
    <div>
      <div className="md:w-full bg-white border-b-2 rounded border-white">
        <div className="flex items-center h-full border-t-2 border-prussian-blue-400 border-opacity-60 rounded justify-between">
          <div className="px-6 py-3">
            <h1 className="title-font text-md font-medium text-gray-900">Projects on this device</h1>
          </div>
          <div className="my-2">
            <ImportProjectButton btnType="icon" />
            <Button
              id="createProject"
              label="Create project"
              labelClassName="hidden"
              href={ANITA_URLS.projectAdd}
              iconLeft="addOutline"
              tooltip='Create a new project'
              type={Type.primary}
              size="sm"
            />
          </div>
        </div>
      </div>
      <div className="p-1 md:w-full">
        {projects.map(project => (<ProjectCard key={project.id} project={project} />))}
      </div>
    </div>
  )
}
