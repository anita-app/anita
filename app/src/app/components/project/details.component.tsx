import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { IProjectSettings } from 'app/models/project/project.declarations'
import { Manager } from 'app/libs/manager/manager.class'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { ProjectDetailsCard } from './details-card'

export const ProjectDetails: React.FC = () => {
  const urlParams = useParams()
  const projectId = urlParams[URL_PARAMS.projectId]
  const [project, setElement] = useState<IProjectSettings | undefined | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProject = async () => {
      const project = await Manager.getProjectById(projectId)

      if (isMounted) {
        setElement(project?.getSettings())
      }
    }

    if (isMounted) {
      loadProject()
    }

    return () => {
      isMounted = false
    }
  }, [projectId])

  // If there is no DB instance loaded, for now we just redirect to the project list
  if (project === undefined) {
    return <Navigate to={ANITA_URLS.projectsList} />
  }

  return (
    <div className="relative border-2 border-gray-200 border-opacity-60 rounded bg-white" style={{ minHeight: '200px' }}>
      {(project === null) ? <Loader /> : <ProjectDetailsCard project={project} />}
    </div>
  )
}
