import { ANITA_URLS, URL_PARAMS } from 'app/libs/routing/anita-routes.constant'
import { availableSystems } from 'app/data/project-form-builder/project-info-builder.constant'
import { IProjectSettings } from 'app/data/project-structure/project-info'
import { Manager } from 'app/libs/manager/Manager.class'
import { SectionElement } from 'app/models/SectionElement/SectionElement.class'
import { DeleteProjectButton } from 'app/components/shared-components/buttons/delete-project.component'
import { EditButton } from 'app/components/shared-components/buttons/edit-project-button.component'
import { ExportButton } from 'app/components/shared-components/buttons/export-project-button.component'
import { CardFooter } from 'app/components/shared-components/common-ui-eles/card-footer.component'
import { Loader } from 'app/components/shared-components/loader/loader.component'
import * as dateFormat from 'date-format'
import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router'

interface ILoadedProjectProps {
  project: IProjectSettings
}

const LoadedProject: React.FC<ILoadedProjectProps> = ({ project }) => (
  <div className="p-6">
    <h1 className="title-font text-lg font-medium text-gray-900 mb-3">{project.title}</h1>

    <p className="text-gray-600 text-xs">Description</p>
    <p className="text-lg mb-3">{project.description}</p>

    <p className="text-gray-600 text-xs">Created on:</p>
    <p className="text-md mb-3">{dateFormat('yyyy/MM/dd, at hh:mm', new Date(project.createdAt))}</p>

    <p className="text-gray-600 text-xs">Storage method:</p>
    <p className="text-md">{SectionElement.txtByFieldValue(availableSystems, project.localStorage)}</p>

    <CardFooter>
      <DeleteProjectButton project={project} />
      <div className="flex items-end">
        <ExportButton />
        <EditButton project={project} />
      </div>
    </CardFooter>

  </div>
)

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
      {(project === null) ? <Loader /> : <LoadedProject project={project} />}
    </div>
  )
}
